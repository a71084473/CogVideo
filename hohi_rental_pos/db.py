"""SQLite 資料層：設備、訂單、訂單明細、寄信紀錄。"""
import sqlite3
from datetime import date, timedelta

from flask import current_app, g

SCHEMA = """
CREATE TABLE IF NOT EXISTS equipment (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT DEFAULT '',
    total_qty INTEGER NOT NULL DEFAULT 1,
    daily_price INTEGER NOT NULL DEFAULT 0,
    note TEXT DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_no TEXT UNIQUE,
    company TEXT NOT NULL,
    contact TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    channel TEXT NOT NULL DEFAULT '',  -- 社群管道：LINE / 蝦皮 / 其他
    rental_start TEXT NOT NULL,      -- 出租起日 YYYY-MM-DD
    rental_end TEXT NOT NULL,        -- 出租迄日 YYYY-MM-DD
    pickup_at TEXT NOT NULL,         -- 預計取貨時間 YYYY-MM-DDTHH:MM
    return_at TEXT NOT NULL,         -- 預計歸還時間 YYYY-MM-DDTHH:MM
    actual_pickup_at TEXT,
    actual_return_at TEXT,
    note TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'draft',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
    confirmed_at TEXT
);
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    equipment_id INTEGER NOT NULL REFERENCES equipment(id),
    qty INTEGER NOT NULL,
    unit_price INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS email_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
    to_addr TEXT NOT NULL,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    status TEXT NOT NULL,            -- sent / failed / logged
    error TEXT DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);
"""

# 會佔用庫存的訂單狀態
RESERVING_STATUSES = ("confirmed", "picked_up")

# 社群管道（客戶從哪裡來預約）
CHANNELS = ("LINE", "蝦皮", "其他")

STATUS_LABELS = {
    "draft": "待確認",
    "confirmed": "已確認",
    "picked_up": "已取貨",
    "returned": "已歸還",
    "cancelled": "已取消",
}


def get_db():
    if "db" not in g:
        g.db = sqlite3.connect(current_app.config["DATABASE"])
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")
    return g.db


def close_db(_exc=None):
    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    db = get_db()
    db.executescript(SCHEMA)
    # 舊資料庫升級：補上社群管道欄位
    cols = {r["name"] for r in db.execute("PRAGMA table_info(orders)")}
    if "channel" not in cols:
        db.execute("ALTER TABLE orders ADD COLUMN channel TEXT NOT NULL DEFAULT ''")
    db.commit()


def parse_date(s):
    return date.fromisoformat(s)


def daterange(start, end):
    d = start
    while d <= end:
        yield d
        d += timedelta(days=1)


def rental_days(order):
    return (parse_date(order["rental_end"]) - parse_date(order["rental_start"])).days + 1


def list_equipment(include_inactive=False):
    sql = "SELECT * FROM equipment"
    if not include_inactive:
        sql += " WHERE active = 1"
    return get_db().execute(sql + " ORDER BY category, name").fetchall()


def booked_qty(equipment_id, day, exclude_order_id=None):
    """某設備在某一天被已確認/已取貨訂單佔用的數量。"""
    sql = f"""
        SELECT COALESCE(SUM(oi.qty), 0) FROM order_items oi
        JOIN orders o ON o.id = oi.order_id
        WHERE oi.equipment_id = ?
          AND o.status IN ({','.join('?' * len(RESERVING_STATUSES))})
          AND o.rental_start <= ? AND o.rental_end >= ?
    """
    params = [equipment_id, *RESERVING_STATUSES, day.isoformat(), day.isoformat()]
    if exclude_order_id:
        sql += " AND o.id != ?"
        params.append(exclude_order_id)
    return get_db().execute(sql, params).fetchone()[0]


def remaining_on(equipment, day, exclude_order_id=None):
    return equipment["total_qty"] - booked_qty(equipment["id"], day, exclude_order_id)


def min_remaining(equipment, start, end, exclude_order_id=None):
    """區間內每日剩餘數量的最小值（= 這段期間最多還能租幾台）。"""
    return min(remaining_on(equipment, d, exclude_order_id) for d in daterange(start, end))


def get_order(order_id):
    return get_db().execute("SELECT * FROM orders WHERE id = ?", (order_id,)).fetchone()


def get_order_items(order_id):
    return get_db().execute(
        """SELECT oi.*, e.name AS equipment_name, e.total_qty
           FROM order_items oi JOIN equipment e ON e.id = oi.equipment_id
           WHERE oi.order_id = ? ORDER BY oi.id""",
        (order_id,),
    ).fetchall()


def order_total(order, items):
    days = rental_days(order)
    return sum(i["qty"] * i["unit_price"] * days for i in items)


def check_availability(order, items):
    """回傳不足庫存的錯誤訊息清單（空清單代表可出租）。"""
    start, end = parse_date(order["rental_start"]), parse_date(order["rental_end"])
    need = {}
    for i in items:
        need[i["equipment_id"]] = need.get(i["equipment_id"], 0) + i["qty"]
    errors = []
    db = get_db()
    for eq_id, qty in need.items():
        eq = db.execute("SELECT * FROM equipment WHERE id = ?", (eq_id,)).fetchone()
        for d in daterange(start, end):
            left = remaining_on(eq, d, exclude_order_id=order["id"])
            if qty > left:
                errors.append(f"{eq['name']} 於 {d.isoformat()} 僅剩 {max(left, 0)} 台，需求 {qty} 台")
                break
    return errors
