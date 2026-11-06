"""ＨＯＨＩ設備空間 — 設備出租 POS 系統。

啟動：
    pip install -r requirements.txt
    python app.py            # http://127.0.0.1:5000
"""
import os
import re
from datetime import date, datetime, timedelta

from flask import Flask, abort, flash, jsonify, redirect, render_template, request, url_for

import db as store
from db import CHANNELS, STATUS_LABELS, get_db, get_order, get_order_items
from mailer import send_confirmation, smtp_config_from_env

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def create_app(test_config=None):
    app = Flask(__name__)
    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY", "hohi-dev-secret"),
        DATABASE=os.environ.get("HOHI_DB", os.path.join(BASE_DIR, "hohi_rental.db")),
        SHOP_NAME=os.environ.get("SHOP_NAME", "ＨＯＨＩ設備空間"),
        SHOP_URL=os.environ.get("SHOP_URL", "https://shopee.tw/saint0978"),
        SHOP_PHONE=os.environ.get("SHOP_PHONE", ""),
        SHOP_EMAIL=os.environ.get("SHOP_EMAIL", ""),
        SHOP_ADDRESS=os.environ.get("SHOP_ADDRESS", ""),
        **smtp_config_from_env(),
    )
    if test_config:
        app.config.update(test_config)

    app.teardown_appcontext(store.close_db)
    with app.app_context():
        store.init_db()

    @app.context_processor
    def inject_globals():
        return {"STATUS_LABELS": STATUS_LABELS, "CHANNELS": CHANNELS, "shop": app.config, "today": date.today().isoformat()}

    @app.template_filter("money")
    def money(v):
        return f"NT$ {int(v or 0):,}"

    @app.template_filter("dt")
    def dt(v):
        return (v or "").replace("T", " ")

    register_routes(app)
    return app


# ---------------------------------------------------------------- helpers
def parse_order_form(form):
    data = {k: (form.get(k) or "").strip() for k in (
        "company", "contact", "email", "phone", "rental_start", "rental_end",
        "pickup_at", "return_at", "note", "channel")}
    errors = []
    labels = {"company": "公司名", "contact": "聯絡人", "email": "信箱", "phone": "電話",
              "rental_start": "出租起日", "rental_end": "出租迄日",
              "pickup_at": "取貨時間", "return_at": "歸還時間"}
    for k, label in labels.items():
        if not data[k]:
            errors.append(f"請填寫{label}")
    if data["channel"] not in CHANNELS:
        errors.append("請選擇社群管道（LINE / 蝦皮 / 其他）")
    if data["email"] and not EMAIL_RE.match(data["email"]):
        errors.append("信箱格式不正確")
    try:
        if data["rental_start"] and data["rental_end"]:
            if store.parse_date(data["rental_end"]) < store.parse_date(data["rental_start"]):
                errors.append("出租迄日不可早於起日")
        if data["pickup_at"] and data["return_at"]:
            if datetime.fromisoformat(data["return_at"]) < datetime.fromisoformat(data["pickup_at"]):
                errors.append("歸還時間不可早於取貨時間")
    except ValueError:
        errors.append("日期格式不正確")

    items = []
    eq_ids, qtys = form.getlist("equipment_id"), form.getlist("qty")
    for eq_id, qty in zip(eq_ids, qtys):
        if not eq_id:
            continue
        try:
            q = int(qty)
        except ValueError:
            q = 0
        if q <= 0:
            errors.append("出租數量需大於 0")
            continue
        eq = get_db().execute("SELECT * FROM equipment WHERE id = ?", (eq_id,)).fetchone()
        if not eq:
            errors.append("找不到設備")
            continue
        items.append({"equipment_id": eq["id"], "qty": q, "unit_price": eq["daily_price"],
                      "equipment_name": eq["name"]})
    if not items:
        errors.append("請至少選擇一項設備")
    return data, items, errors


def save_order(data, items, order_id=None):
    db = get_db()
    cols = ("company", "contact", "email", "phone", "channel", "rental_start", "rental_end",
            "pickup_at", "return_at", "note")
    if order_id:
        db.execute(f"UPDATE orders SET {', '.join(c + ' = ?' for c in cols)} WHERE id = ?",
                   [data[c] for c in cols] + [order_id])
        db.execute("DELETE FROM order_items WHERE order_id = ?", (order_id,))
    else:
        cur = db.execute(f"INSERT INTO orders ({', '.join(cols)}) VALUES ({', '.join('?' * len(cols))})",
                         [data[c] for c in cols])
        order_id = cur.lastrowid
        order_no = f"H{date.today():%Y%m%d}-{order_id:04d}"
        db.execute("UPDATE orders SET order_no = ? WHERE id = ?", (order_no, order_id))
    db.executemany(
        "INSERT INTO order_items (order_id, equipment_id, qty, unit_price) VALUES (?,?,?,?)",
        [(order_id, i["equipment_id"], i["qty"], i["unit_price"]) for i in items])
    db.commit()
    return order_id


def confirm_order(order_id):
    """檢查庫存 → 狀態改為已確認 → 自動寄信。回傳 (ok, messages)。"""
    order = get_order(order_id)
    items = get_order_items(order_id)
    errors = store.check_availability(order, items)
    if errors:
        return False, errors
    db = get_db()
    db.execute("UPDATE orders SET status = 'confirmed', confirmed_at = datetime('now','localtime') "
               "WHERE id = ?", (order_id,))
    db.commit()
    status, err = send_confirmation(get_order(order_id))
    msg = {"sent": f"已確認出租，確認信已寄至 {order['email']}",
           "logged": "已確認出租（尚未設定 SMTP，確認信僅記錄於寄信紀錄）",
           "failed": f"已確認出租，但寄信失敗：{err}"}[status]
    return True, [msg]


# ---------------------------------------------------------------- routes
def register_routes(app):

    @app.route("/")
    def dashboard():
        day_s = request.args.get("date") or date.today().isoformat()
        try:
            day = store.parse_date(day_s)
        except ValueError:
            day = date.today()
        rows = []
        for eq in store.list_equipment():
            booked = store.booked_qty(eq["id"], day)
            rows.append({"eq": eq, "booked": booked, "remaining": eq["total_qty"] - booked})
        db = get_db()
        pickups = db.execute(
            "SELECT * FROM orders WHERE substr(pickup_at,1,10) = ? AND status IN ('confirmed','draft') "
            "ORDER BY pickup_at", (day.isoformat(),)).fetchall()
        returns = db.execute(
            "SELECT * FROM orders WHERE substr(return_at,1,10) = ? AND status = 'picked_up' "
            "ORDER BY return_at", (day.isoformat(),)).fetchall()
        overdue = db.execute(
            "SELECT * FROM orders WHERE status = 'picked_up' AND return_at < ? ORDER BY return_at",
            (datetime.now().strftime("%Y-%m-%dT%H:%M"),)).fetchall()
        return render_template("dashboard.html", day=day, rows=rows, pickups=pickups,
                               returns=returns, overdue=overdue,
                               prev_day=(day - timedelta(days=1)).isoformat(),
                               next_day=(day + timedelta(days=1)).isoformat())

    @app.route("/availability")
    def availability():
        start_s = request.args.get("start") or date.today().isoformat()
        try:
            start = store.parse_date(start_s)
        except ValueError:
            start = date.today()
        days = [start + timedelta(days=i) for i in range(14)]
        grid = [{"eq": eq, "cells": [store.remaining_on(eq, d) for d in days]}
                for eq in store.list_equipment()]
        return render_template("availability.html", start=start, days=days, grid=grid,
                               prev=(start - timedelta(days=14)).isoformat(),
                               next=(start + timedelta(days=14)).isoformat())

    @app.route("/api/availability")
    def api_availability():
        try:
            start = store.parse_date(request.args["start"])
            end = store.parse_date(request.args.get("end") or request.args["start"])
        except (KeyError, ValueError):
            return jsonify({"error": "invalid date"}), 400
        if end < start:
            return jsonify({"error": "end before start"}), 400
        exclude = request.args.get("exclude", type=int)
        return jsonify({str(eq["id"]): store.min_remaining(eq, start, end, exclude)
                        for eq in store.list_equipment()})

    # ---- 設備
    @app.route("/equipment", methods=["GET", "POST"])
    def equipment():
        db = get_db()
        if request.method == "POST":
            name = request.form.get("name", "").strip()
            try:
                total = int(request.form.get("total_qty", 0))
                price = int(request.form.get("daily_price", 0) or 0)
            except ValueError:
                total, price = -1, -1
            if not name or total < 0 or price < 0:
                flash("請填寫設備名稱，數量與單價需為非負整數", "error")
            else:
                db.execute("INSERT INTO equipment (name, category, total_qty, daily_price, note) "
                           "VALUES (?,?,?,?,?)",
                           (name, request.form.get("category", "").strip(), total, price,
                            request.form.get("note", "").strip()))
                db.commit()
                flash(f"已新增設備：{name}", "ok")
            return redirect(url_for("equipment"))
        items = store.list_equipment(include_inactive=True)
        remaining = {e["id"]: store.remaining_on(e, date.today()) for e in items}
        return render_template("equipment.html", items=items, remaining=remaining)

    @app.route("/equipment/<int:eq_id>/edit", methods=["GET", "POST"])
    def equipment_edit(eq_id):
        db = get_db()
        eq = db.execute("SELECT * FROM equipment WHERE id = ?", (eq_id,)).fetchone() or abort(404)
        if request.method == "POST":
            try:
                total = int(request.form.get("total_qty", 0))
                price = int(request.form.get("daily_price", 0) or 0)
            except ValueError:
                total, price = -1, -1
            name = request.form.get("name", "").strip()
            if not name or total < 0 or price < 0:
                flash("請填寫設備名稱，數量與單價需為非負整數", "error")
                return redirect(url_for("equipment_edit", eq_id=eq_id))
            db.execute("UPDATE equipment SET name=?, category=?, total_qty=?, daily_price=?, note=?, "
                       "active=? WHERE id=?",
                       (name, request.form.get("category", "").strip(), total, price,
                        request.form.get("note", "").strip(),
                        1 if request.form.get("active") else 0, eq_id))
            db.commit()
            flash("設備已更新", "ok")
            return redirect(url_for("equipment"))
        return render_template("equipment_edit.html", eq=eq)

    # ---- 訂單
    @app.route("/orders")
    def orders():
        status = request.args.get("status", "")
        channel = request.args.get("channel", "")
        q = request.args.get("q", "").strip()
        sql, params = "SELECT * FROM orders WHERE 1=1", []
        if channel:
            sql += " AND channel = ?"
            params.append(channel)
        if status:
            sql += " AND status = ?"
            params.append(status)
        if q:
            sql += " AND (company LIKE ? OR contact LIKE ? OR phone LIKE ? OR email LIKE ? OR order_no LIKE ?)"
            params += [f"%{q}%"] * 5
        rows = get_db().execute(sql + " ORDER BY rental_start DESC, id DESC", params).fetchall()
        return render_template("orders.html", orders=rows, status=status, channel=channel, q=q)

    def order_form(order=None, items=None, form=None):
        initial = [{"equipment_id": i["equipment_id"], "qty": i["qty"]} for i in (items or [])]
        return render_template("order_form.html", order=order, initial_items=initial,
                               form=form or {}, equipment=store.list_equipment())

    @app.route("/orders/new", methods=["GET", "POST"])
    def order_new():
        if request.method == "POST":
            data, items, errors = parse_order_form(request.form)
            if errors:
                for e in errors:
                    flash(e, "error")
                return order_form(items=items, form=data)
            order_id = save_order(data, items)
            if request.form.get("action") == "confirm":
                ok, msgs = confirm_order(order_id)
                for m in msgs:
                    flash(m, "ok" if ok else "error")
            else:
                flash("訂單已建立（待確認）", "ok")
            return redirect(url_for("order_detail", order_id=order_id))
        return order_form()

    @app.route("/orders/<int:order_id>")
    def order_detail(order_id):
        order = get_order(order_id) or abort(404)
        items = get_order_items(order_id)
        emails = get_db().execute("SELECT * FROM email_log WHERE order_id = ? ORDER BY id DESC",
                                  (order_id,)).fetchall()
        return render_template("order_detail.html", order=order, items=items, emails=emails,
                               days=store.rental_days(order), total=store.order_total(order, items))

    @app.route("/orders/<int:order_id>/edit", methods=["GET", "POST"])
    def order_edit(order_id):
        order = get_order(order_id) or abort(404)
        if order["status"] not in ("draft", "confirmed"):
            flash("已取貨/已歸還/已取消的訂單不可修改", "error")
            return redirect(url_for("order_detail", order_id=order_id))
        if request.method == "POST":
            data, items, errors = parse_order_form(request.form)
            if not errors and order["status"] == "confirmed":
                errors = store.check_availability({**data, "id": order_id}, items)
            if errors:
                for e in errors:
                    flash(e, "error")
                return order_form(order=order, items=items, form=data)
            save_order(data, items, order_id)
            flash("訂單已更新", "ok")
            return redirect(url_for("order_detail", order_id=order_id))
        return order_form(order=order, items=get_order_items(order_id), form=dict(order))

    @app.post("/orders/<int:order_id>/action")
    def order_action(order_id):
        order = get_order(order_id) or abort(404)
        action = request.form.get("action")
        db = get_db()
        now = datetime.now().strftime("%Y-%m-%dT%H:%M")
        transitions = {
            "confirm": ("draft",),
            "pickup": ("confirmed",),
            "return": ("picked_up",),
            "cancel": ("draft", "confirmed"),
            "resend": ("confirmed", "picked_up"),
        }
        if action not in transitions or order["status"] not in transitions[action]:
            flash("此訂單狀態無法執行該操作", "error")
            return redirect(url_for("order_detail", order_id=order_id))
        if action == "confirm":
            ok, msgs = confirm_order(order_id)
            for m in msgs:
                flash(m, "ok" if ok else "error")
        elif action == "pickup":
            db.execute("UPDATE orders SET status='picked_up', actual_pickup_at=? WHERE id=?", (now, order_id))
            db.commit()
            flash("已登記取貨", "ok")
        elif action == "return":
            db.execute("UPDATE orders SET status='returned', actual_return_at=? WHERE id=?", (now, order_id))
            db.commit()
            flash("已登記歸還，設備已釋出", "ok")
        elif action == "cancel":
            db.execute("UPDATE orders SET status='cancelled' WHERE id=?", (order_id,))
            db.commit()
            flash("訂單已取消", "ok")
        elif action == "resend":
            status, err = send_confirmation(order)
            flash({"sent": "確認信已重新寄出", "logged": "未設定 SMTP，已記錄於寄信紀錄",
                   "failed": f"寄信失敗：{err}"}[status], "error" if status == "failed" else "ok")
        return redirect(url_for("order_detail", order_id=order_id))

    @app.route("/emails")
    def emails():
        rows = get_db().execute(
            "SELECT l.*, o.order_no FROM email_log l LEFT JOIN orders o ON o.id = l.order_id "
            "ORDER BY l.id DESC LIMIT 200").fetchall()
        return render_template("emails.html", rows=rows, smtp_on=bool(app.config.get("SMTP_HOST")))


if __name__ == "__main__":
    create_app().run(host=os.environ.get("HOST", "127.0.0.1"), port=int(os.environ.get("PORT", 5000)), debug=False)
