# ＨＯＨＩ設備空間 — 設備出租 POS

給 [ＨＯＨＩ設備空間](https://shopee.tw/saint0978) 使用的設備出租 POS 系統（Flask + SQLite，免另外架資料庫）。

## 功能
- **設備管理**：設備名稱、分類、總數量、每日租金、備註、上架／停用
- **出租單**（可一張單租多種設備）
  - 出租時間（起日～迄日）、取貨時間、歸還時間
  - 公司名、聯絡人、信箱、電話、社群管道（LINE／蝦皮／其他）、備註欄
  - 依天數 × 日租金自動計算金額
  - 選擇設備時即時顯示「該期間可租數量」，超量會標紅
- **設備當日剩下數量**
  - 今日總覽：選任一天，看每項設備剩餘／總數，以及當日取貨、歸還清單、逾期未還提醒
  - 庫存日曆：14 天 × 每項設備的剩餘數量表
- **訂單流程**：待確認 → 已確認 → 已取貨 → 已歸還（或取消）
  - 只有「已確認／已取貨」會佔庫存；確認時會檢查每一天的庫存，不足就無法確認
  - 取貨／歸還可一鍵登記實際時間
- **貼上預約文字自動填單**：新增出租時，把客戶傳來的 LINE／Email／表單文字整段貼上，按「辨識並填入」，
  自動辨識公司、聯絡人、電話、信箱、出租日期、取貨／歸還時間、設備與數量（支援 `11/20~22`、`12月5日`、民國年、
  `下午6點`、`麥克風兩支`、`投影機x2` 等寫法），填入的欄位會標色提醒確認；對不到的設備會列出來
- **確認出租後自動寄信給客戶**（HTML + 純文字），可重寄；所有寄信紀錄可在「寄信紀錄」頁查詢
- 訂單頁可直接列印

## 安裝與啟動
```bash
cd hohi_rental_pos
pip install -r requirements.txt
python app.py        # 開啟 http://127.0.0.1:5000
```
區網內其他電腦／平板要連線：`HOST=0.0.0.0 python app.py`。
正式部署可用：`pip install gunicorn && gunicorn -w 2 -b 0.0.0.0:8000 wsgi:app`。
資料存在 `hohi_rental.db`（可用環境變數 `HOHI_DB` 指定路徑），請定期備份。

## 自動寄信設定（SMTP）
未設定時，確認信只會寫入「寄信紀錄」不會真的寄出。以 Gmail 為例（需先開啟兩步驟驗證並建立「應用程式密碼」）：
```bash
export SMTP_HOST=smtp.gmail.com
export SMTP_PORT=587
export SMTP_SECURITY=starttls          # starttls / ssl / none
export SMTP_USER=yourname@gmail.com
export SMTP_PASSWORD=應用程式密碼
export SMTP_FROM="ＨＯＨＩ設備空間 <yourname@gmail.com>"
# 信件底部店家資訊（選填）
export SHOP_PHONE=09xx-xxx-xxx
export SHOP_EMAIL=yourname@gmail.com   # 客戶回信地址
export SHOP_ADDRESS=取貨地址
python app.py
```

## 測試
```bash
pip install pytest && python -m pytest -q tests
node tests/parser.test.js     # 預約文字辨識
```
