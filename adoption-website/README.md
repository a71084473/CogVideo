# 🐾 毛孩之家 — 流浪動物領養平台

一個以「**領養前 → 領養時 → 領養後**」完整旅程為核心的流浪動物領養網站設計，
包含可直接在瀏覽器打開的**互動原型**（純 HTML/CSS/JS，零依賴、免建置），
以及正式系統所需的**架構與 API 設計文件**（本文件下半部）。

## 快速開始（Demo 原型）

```bash
cd adoption-website
python3 -m http.server 8080   # 或直接用瀏覽器打開 index.html
# 開啟 http://localhost:8080
```

所有資料以 `localStorage` 模擬資料庫，清除瀏覽器資料即可重置 Demo。

---

## 四大核心功能模組

### ✅ 功能 1：即時領養證書系統（`js/certificate.js`）

| 需求 | 原型實作 | 正式系統設計 |
|---|---|---|
| 領養成功自動生成電子證書 | Canvas 即時繪製，可選毛孩或上傳照片 | 領養申請審核通過時，由後端事件觸發生成 |
| 證書內容：照片、名字、領養人、日期 | 全部支援，輸入即時重繪 | 後端以 headless 渲染（如 Puppeteer / node-canvas）產生 PNG + PDF，存 S3 並附唯一證書編號防偽 |
| 下載與一鍵分享 | PNG 下載；FB / LINE 開啟分享視窗；IG 因無網頁分享 API，改為「下載圖片＋自動複製貼文文案」 | 分享連結帶 OG meta（og:image 指向證書圖），社群預覽即顯示證書 |

### ✅ 功能 2：個性化紀念品訂製（`js/shop.js`）

- **商品**：馬克杯（NT$350）、寵物吊牌（NT$180）、T 恤（NT$490）。
- **即時預覽**：Canvas 合成「商品外型＋毛孩照片＋名字＋祝福語」，輸入任何欄位即時重繪。
- **祝福語客製**：選填欄位，同步出現在預覽與訂單明細。
- **結帳**：收件資訊＋付款方式（信用卡 / LINE Pay / 貨到付款）的模擬結帳彈窗。
- **物流追蹤**：訂單卡片附五階段時間軸（已下單 → 製作中 → 已出貨 → 配送中 → 已送達），Demo 中每 8 秒自動推進模擬物流商回報。
- **正式系統**：金流接 ECPay / TapPay / Stripe；物流狀態由物流商 webhook 回寫 `orders.status`；預覽圖在下單時上傳後端做為生產稿。

### ✅ 功能 3：領養故事牆（`js/stories.js`）

- 自動顯示成功領養案例：**合照（頭像）＋一句話感言＋領養日期＋領養人**。
- 訪客可**按讚**（每人每則一次、可收回）與**留言祝賀**（前端已做 HTML escape 防 XSS）。
- **三組篩選**：動物種類（狗/貓/兔）、地區（台北/台中/高雄/花蓮）、排序（最新/最早/最多祝福）。
- 正式系統：留言需登入＋敏感詞過濾；列表用 cursor 分頁；新故事由「領養完成」事件自動發布。

### ✅ 功能 4：領養人長期關懷模組（`js/journey.js`）

- **回訪排程**：依領養日自動排出滿 1 / 3 / 6 個月的關懷提醒，並標示「已寄送／排程中」。
- **線上近況問卷**：健康狀況、適應程度、自由留言三題，送出後寫入時間線。
- **我的領養旅程**：
  - **徽章牆**（8 枚）：完成領養、生成證書、訂製紀念品、填問卷等互動即時解鎖；滿月/季度/半年/週年徽章按時間自動點亮。
  - **時間線**：領養日、關懷信寄送紀錄、問卷回報依時序呈現。
- **跨模組連動**：在功能 1 生成證書、功能 2 完成訂單時，會即時解鎖對應徽章（提升回訪黏著度）。

---

## 正式系統架構設計

```
┌──────────────┐     ┌────────────────────────────────────┐
│  前端 (SPA)   │────▶│  API Gateway / BFF (Node.js)        │
│ React/Vue    │     ├────────────────────────────────────┤
└──────────────┘     │ adoption-svc   領養申請/審核/故事牆   │
                     │ cert-svc       證書生成(node-canvas) │
                     │ shop-svc       商品/訂單/金流/物流    │
                     │ care-svc       回訪排程/問卷/徽章     │
                     └───────┬───────────────┬────────────┘
                             │               │
                     ┌───────▼─────┐   ┌─────▼──────────────┐
                     │ PostgreSQL  │   │ 任務佇列 + Cron      │
                     │ + S3(圖片)  │   │ (BullMQ / Redis)    │
                     └─────────────┘   │ → Email/LINE 推播   │
                                       └────────────────────┘
外部整合：ECPay/Stripe（金流）、黑貓/超商 webhook（物流）、
          SendGrid（Email）、LINE Notify（提醒）、FB/LINE 分享 OG
```

### 核心資料模型

```sql
animals    (id, name, species, region, photo_url, status: waiting|adopted, description)
users      (id, name, email, phone)
adoptions  (id, animal_id, user_id, adopted_at, certificate_url, status)
stories    (id, adoption_id, photo_url, quote, likes, published_at)
comments   (id, story_id, user_id, text, created_at)
products   (id, type: mug|tag|tshirt, price)
orders     (id, user_id, product_id, qty, pet_name, message, preview_url,
            total, payment_method, status, tracking_no, address, created_at)
care_tasks (id, adoption_id, due_at, type: m1|m3|m6, sent_at)      -- 由 cron 掃描寄送
surveys    (id, adoption_id, health, adapt, note, submitted_at)
badges     (id, user_id, badge_key, unlocked_at)
```

### 關鍵 API（REST）

```
POST /api/adoptions                     # 送出領養申請
POST /api/adoptions/:id/approve         # 審核通過 → 觸發證書生成 + 建立 care_tasks + 發佈故事
GET  /api/certificates/:id              # 取得證書（PNG/PDF + 分享連結）
GET  /api/stories?species=&region=&sort=&cursor=
POST /api/stories/:id/like | /comments
POST /api/orders                        # 建單 → 金流 → 回傳 payment_url
POST /api/webhooks/payment | /logistics # 金流/物流商回呼，更新訂單狀態
GET  /api/me/journey                    # 時間線 + 徽章 + 提醒排程
POST /api/surveys                       # 回訪問卷
```

### 回訪提醒流程（功能 4 後端）

1. 領養審核通過時，`care-svc` 依 `adopted_at` 建立三筆 `care_tasks`（+1m / +3m / +6m）。
2. Cron 每日掃描 `due_at <= today AND sent_at IS NULL`，經佇列寄送 Email / LINE 提醒，內含問卷連結。
3. 問卷送出後寫入 `surveys`，解鎖徽章並更新使用者時間線；異常回報（如「需要協助」）自動建立追蹤工單給志工。

---

## 檔案結構

```
adoption-website/
├── index.html          # 單頁應用：首頁 + 四大功能模組
├── css/style.css       # 全站樣式（暖色系、響應式）
└── js/
    ├── data.js         # 種子資料 + localStorage 持久化 + 頭像繪製
    ├── app.js          # 頁面切換、首頁渲染、Toast
    ├── stories.js      # 功能 3：故事牆
    ├── certificate.js  # 功能 1：領養證書
    ├── shop.js         # 功能 2：紀念品訂製
    └── journey.js      # 功能 4：長期關懷
```
