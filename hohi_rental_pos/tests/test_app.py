import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import create_app  # noqa: E402
from db import get_db  # noqa: E402


@pytest.fixture
def app(tmp_path):
    return create_app({"TESTING": True, "DATABASE": str(tmp_path / "t.db"), "SMTP_HOST": ""})


@pytest.fixture
def client(app):
    c = app.test_client()
    c.post("/equipment", data={"name": "投影機", "category": "影像", "total_qty": 3, "daily_price": 1000})
    c.post("/equipment", data={"name": "麥克風", "category": "音響", "total_qty": 5, "daily_price": 200})
    return c


def order_data(**kw):
    d = dict(company="好好公司", contact="王小明", email="ming@example.com", phone="0912345678", channel="LINE",
             rental_start="2026-12-01", rental_end="2026-12-03",
             pickup_at="2026-12-01T10:00", return_at="2026-12-03T18:00", note="需要延長線",
             equipment_id=["1", "2"], qty=["2", "1"], action="confirm")
    d.update(kw)
    return d


def test_confirm_reserves_stock_and_logs_email(app, client):
    r = client.post("/orders/new", data=order_data(), follow_redirects=True)
    assert "已確認出租" in r.get_data(as_text=True)
    avail = client.get("/api/availability?start=2026-12-01&end=2026-12-03").get_json()
    assert avail == {"1": 1, "2": 4}
    assert client.get("/api/availability?start=2026-12-04").get_json() == {"1": 3, "2": 5}
    with app.app_context():
        log = get_db().execute("SELECT * FROM email_log").fetchall()
        assert len(log) == 1 and log[0]["to_addr"] == "ming@example.com" and log[0]["status"] == "logged"
        body = log[0]["body"]
        for s in ("好好公司", "2026-12-01 10:00", "2026-12-03 18:00", "投影機 × 2", "NT$ 6,600", "需要延長線"):
            assert s in body
    dash = client.get("/?date=2026-12-02").get_data(as_text=True)
    assert "當日已出租 2" in dash


def test_overbooking_rejected(app, client):
    client.post("/orders/new", data=order_data())
    r = client.post("/orders/new", data=order_data(rental_start="2026-12-03", rental_end="2026-12-05",
                                                   pickup_at="2026-12-03T10:00", return_at="2026-12-05T10:00",
                                                   equipment_id=["1"], qty=["2"]), follow_redirects=True)
    assert "2026-12-03 僅剩 1 台" in r.get_data(as_text=True)
    with app.app_context():
        assert get_db().execute("SELECT status FROM orders WHERE id=2").fetchone()[0] == "draft"


def test_draft_does_not_reserve_and_lifecycle(app, client):
    client.post("/orders/new", data=order_data(action="save"))
    assert client.get("/api/availability?start=2026-12-02").get_json()["1"] == 3
    client.post("/orders/1/action", data={"action": "confirm"})
    assert client.get("/api/availability?start=2026-12-02").get_json()["1"] == 1
    client.post("/orders/1/action", data={"action": "pickup"})
    assert client.get("/api/availability?start=2026-12-02").get_json()["1"] == 1
    client.post("/orders/1/action", data={"action": "return"})
    assert client.get("/api/availability?start=2026-12-02").get_json()["1"] == 3
    with app.app_context():
        o = get_db().execute("SELECT * FROM orders WHERE id=1").fetchone()
        assert o["status"] == "returned" and o["actual_return_at"]


def test_validation(client):
    r = client.post("/orders/new", data=order_data(email="bad"), follow_redirects=True)
    assert "信箱格式不正確" in r.get_data(as_text=True)


def test_all_fields_optional(app, client):
    r = client.post("/orders/new", data={"action": "confirm"}, follow_redirects=True)
    t = r.get_data(as_text=True)
    assert "未填信箱，沒有寄確認信" in t
    with app.app_context():
        o = get_db().execute("SELECT * FROM orders").fetchone()
        assert o["status"] == "confirmed" and o["company"] == "" and o["pickup_at"].endswith("T10:00")
        assert get_db().execute("SELECT COUNT(*) FROM email_log").fetchone()[0] == 0


def test_channel_saved_and_filter(app, client):
    client.post("/orders/new", data=order_data(channel="蝦皮", action="save"))
    with app.app_context():
        assert get_db().execute("SELECT channel FROM orders").fetchone()[0] == "蝦皮"
    assert "蝦皮" in client.get("/orders?channel=蝦皮").get_data(as_text=True)
    assert "好好公司" not in client.get("/orders?channel=LINE").get_data(as_text=True)


def test_smtp_send(app, client, monkeypatch):
    sent = []
    import mailer
    monkeypatch.setattr(mailer, "_send_smtp", lambda *a: sent.append(a))
    app.config["SMTP_HOST"] = "smtp.example.com"
    r = client.post("/orders/new", data=order_data(), follow_redirects=True)
    assert "確認信已寄至 ming@example.com" in r.get_data(as_text=True)
    assert sent and sent[0][0] == "ming@example.com"


def test_pages_render(client):
    client.post("/orders/new", data=order_data())
    for url in ("/", "/availability?start=2026-12-01", "/orders", "/orders/new", "/orders/1",
                "/orders/1/edit", "/equipment", "/equipment/1/edit", "/emails"):
        assert client.get(url).status_code == 200, url
