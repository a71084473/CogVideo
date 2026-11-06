"""確認出租後寄送通知信給客戶。

SMTP 透過環境變數設定（以 Gmail 為例）：
    SMTP_HOST=smtp.gmail.com
    SMTP_PORT=587
    SMTP_USER=你的帳號@gmail.com
    SMTP_PASSWORD=Gmail 應用程式密碼
    SMTP_FROM=ＨＯＨＩ設備空間 <你的帳號@gmail.com>
    SMTP_SECURITY=starttls   # starttls / ssl / none
未設定 SMTP_HOST 時不會真的寄出，只會記錄在「寄信紀錄」頁面，方便測試。
"""
import os
import smtplib
from email.message import EmailMessage
from email.utils import formataddr

from flask import current_app, render_template

from db import get_db, get_order_items, order_total, rental_days


def _send_smtp(to_addr, subject, text, html):
    cfg = current_app.config
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = cfg["SMTP_FROM"] or formataddr((cfg["SHOP_NAME"], cfg["SMTP_USER"]))
    msg["To"] = to_addr
    if cfg.get("SHOP_EMAIL"):
        msg["Reply-To"] = cfg["SHOP_EMAIL"]
    msg.set_content(text)
    msg.add_alternative(html, subtype="html")

    port = int(cfg["SMTP_PORT"])
    security = cfg["SMTP_SECURITY"].lower()
    if security == "ssl":
        server = smtplib.SMTP_SSL(cfg["SMTP_HOST"], port, timeout=20)
    else:
        server = smtplib.SMTP(cfg["SMTP_HOST"], port, timeout=20)
        if security == "starttls":
            server.starttls()
    with server:
        if cfg["SMTP_USER"]:
            server.login(cfg["SMTP_USER"], cfg["SMTP_PASSWORD"])
        server.send_message(msg)


def send_confirmation(order):
    """寄出出租確認信，並寫入 email_log。回傳 (status, error)。"""
    items = get_order_items(order["id"])
    ctx = dict(
        order=order,
        items=items,
        days=rental_days(order),
        total=order_total(order, items),
        shop=current_app.config,
    )
    subject = f"【{current_app.config['SHOP_NAME']}】設備出租確認通知 #{order['order_no']}"
    text = render_template("email/confirmation.txt", **ctx)
    html = render_template("email/confirmation.html", **ctx)

    status, error = "logged", ""
    if current_app.config.get("SMTP_HOST"):
        try:
            _send_smtp(order["email"], subject, text, html)
            status = "sent"
        except Exception as exc:  # noqa: BLE001 - 任何寄信錯誤都記錄下來
            status, error = "failed", str(exc)

    db = get_db()
    db.execute(
        "INSERT INTO email_log (order_id, to_addr, subject, body, status, error) VALUES (?,?,?,?,?,?)",
        (order["id"], order["email"], subject, text, status, error),
    )
    db.commit()
    return status, error


def smtp_config_from_env():
    return {
        "SMTP_HOST": os.environ.get("SMTP_HOST", ""),
        "SMTP_PORT": os.environ.get("SMTP_PORT", "587"),
        "SMTP_USER": os.environ.get("SMTP_USER", ""),
        "SMTP_PASSWORD": os.environ.get("SMTP_PASSWORD", ""),
        "SMTP_FROM": os.environ.get("SMTP_FROM", ""),
        "SMTP_SECURITY": os.environ.get("SMTP_SECURITY", "starttls"),
    }
