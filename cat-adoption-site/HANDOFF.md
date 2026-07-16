# 合拍 PawMatch 專案交接文件（HANDOFF）

> 用途：在**另一台電腦**接續本專案。這份文件說明目前進度、檔案位置、如何執行、以及待辦事項。
> 打包時間：2026-07-09　·　工作分支：`claude/cat-adoption-prompt-suite-zzaho0`

---

## 0. 一分鐘看懂這個專案

「合拍 PawMatch」是一個**貓咪認養平台的單頁式網站 MVP**，依據對台灣貓咪中途之家的深度研究（Prompt 組 + 4 場訪談）設計。核心設計主張：**凡「轉換率」與「被審查感」衝突，一律先消除被審查感**——用生活樣態配對取代審核問卷、用個性敘事取代條件比對、用去人化的曬貓回報取代監控式追蹤。

已完成兩件事：
1. **網站本體**（依 Prompt A 主站 + B1–B5 模組深化 + Prompt C 易用性驗收生成）。
2. **易用性測試報告**（整理 4 場中途訪談 → 領養者行為與心理分析 → 三位 persona 模擬走查 → 功能對領養率的貢獻度評分）。

---

## 1. 目前進度（已完成 ✅）

| 項目 | 狀態 | 檔案 |
|---|---|---|
| Prompt 組原始文件保存 | ✅ | `cat-adoption-site/PROMPTS.md` |
| 網站主站（可讀原始碼版，CDN） | ✅ | `cat-adoption-site/index.html` |
| 網站離線版（零相依、雙擊即開，已 Chromium 實測） | ✅ | `cat-adoption-site/index.offline.html` |
| 設計計畫 + 驗收紀錄 | ✅ | `cat-adoption-site/README.md` |
| 4 場訪談逐字稿（已從 .docx 抽出文字） | ✅ | `research/interview_*.txt` |
| 易用性測試報告（Markdown） | ✅ | `cat-adoption-site/USABILITY-REPORT.md` |
| 易用性測試報告（互動 HTML，可雙擊預覽） | ✅ | `reports/usability-report.html` |

**網站已實作的 6 大區塊 + 模組深化：**
Hero（利己主張＋雙 CTA）／生活樣態配對測驗（一屏一題·可跳過·貓掌進度·加權向量配對·引用答案的合拍理由）／個性敘事貓咪檔案（第一人稱故事·健康護照時間軸·以貓為主詞的需求卡）／認養旅程四階段／成長相簿＋回家之後（曬貓回報·抽獎·隱私預設私密）／新手支援與透明區（匿名發問·無責退回·透明帳本）／中途後台（兩檔位提醒·系統轉介）。

**線上預覽（Artifact，私人連結）：**
- 網站：https://claude.ai/code/artifact/d28a00e1-debd-44cb-8959-c493a18cd803
- 易用性報告：https://claude.ai/code/artifact/3e709a2f-1ff6-43a6-9c79-1e2276dd8adb

> 註：Artifact 連結預設為私人，需在頁面分享選單開啟才可分享。這些連結是雲端渲染，與本 ZIP 內的檔案內容一致。

---

## 2. 檔案地圖（ZIP 內容）

```
pawmatch-handoff/
├── HANDOFF.md                    ← 你正在看的這份（進度＋代辦）
├── cat-adoption-site/            ← 網站本體（= git repo 內同名資料夾）
│   ├── index.html                ← 【要改程式改這份】可讀 React+Tailwind CDN 版
│   ├── index.offline.html        ← 【要展示用這份】零網路、雙擊即開
│   ├── PROMPTS.md                ← 原始 Prompt A/B1–B5/C 全文
│   ├── README.md                 ← 設計計畫、色票、驗收紀錄
│   └── USABILITY-REPORT.md       ← 易用性測試報告（文字版）
├── reports/
│   └── usability-report.html     ← 易用性報告（互動版，雙擊即開）
└── research/
    └── interview_*.txt           ← 4 場中途訪談逐字稿（分析原料）
```

---

## 3. 在另一台電腦怎麼接續

### 方式 A：從 GitHub 接續（推薦，保留 git 歷史）
專案已推送到分支，直接 clone 下來即可：
```bash
git clone <你的 repo URL> CogVideo
cd CogVideo
git checkout claude/cat-adoption-prompt-suite-zzaho0
cd cat-adoption-site
```
> 本次工作全部在 `claude/cat-adoption-prompt-suite-zzaho0` 分支，尚未合併到 main、尚未開 PR。

### 方式 B：直接用這個 ZIP（無 git）
解壓縮後，`cat-adoption-site/` 就是完整網站，不需安裝任何東西。

### 執行 / 預覽網站
- **最簡單**：直接用瀏覽器雙擊 `index.offline.html`（零相依）。
- **要改程式**：改 `index.html`（React 寫在 `<script type="text/babel">` 內），存檔後瀏覽器重整即可（需網路載入 React/Tailwind CDN）。
- 或起本機伺服器：`python3 -m http.server 8000` 後開 `http://localhost:8000/index.html`。

### 重新產生離線版（若你改了 index.html）
離線版是把 `index.html` 的 JSX 用 esbuild 預編譯、Tailwind 預產 CSS、React 內嵌而成。重建步驟：
```bash
# 需 node。把 index.html 內 <script type=text/babel> 的內容存成 app.jsx
npm i react@18 react-dom@18 tailwindcss@3 esbuild
npx esbuild app.jsx --loader:.jsx=jsx --minify --outfile=app.js
npx tailwindcss -i input.css -o tw.css --minify   # content 指向 app.jsx
# 再把 react/react-dom UMD + tw.css + app.js 串成單一 HTML（參考現有 index.offline.html 結構）
```
> 大多數情況只維護 `index.html` 即可；離線版是給「無網路展示 / 交付」用的。

---

## 4. 待辦事項（TODO）

### ✅ 已完成（2026-07-09 更新）：改進清單已實作為 A/B 變異組
P0/P1/P2 的五項改進（C1 除罪化、C2 隱私說明、C3 試相處前移、C4 退回入口、C5 相簿導流）
**已全部實作進 `index.html` 的變異組 B**——左下角「AB 測試預覽」切換，或 `?v=b` 直連；A 控制組一字未動。
模擬 A/B 研究完成（見 `AB-TEST-REPORT.md`，模擬腳本 `sim_ab.py`）：主指標送出意向率 +7.4pp（p<.0001）、
護欄零惡化；決策建議＝C1–C4 打包上線、C5 另行驗證。

### 🔴 新的下一步
- [ ] **打開真實分流**：依 `AB-TEST-REPORT.md` §9 部署真實 A/B（50/50 cookie 分流、每組 n≈3,100、埋 intent_sent 等事件）。
- [ ] 若不做真實實驗,直接把變異組 B 設為預設版本（把 `useState('a')` 初始值改 'b'）並移除切換器。

### 🟡 次要優化（未實作）
- [ ] 中途後台的「系統轉介」結果，回饋到認養人端（讓被婉拒者收到替代推薦）。

### 🟢 產品化方向（若要從 MVP 走向真實產品）
- [ ] 把假資料（6 隻貓、12 張相簿、帳本）接後端 / CMS。
- [ ] 照片佔位圖（目前是 SVG 毛色漸層）換成真實貓照；替換點在 `CatAvatar` 元件。
- [ ] 中途實名、健康護照、帳本改為可驗證的真實資料來源。
- [ ] 真人易用性測試：招募 5–8 位真實新手認養人做 moderated test，重點量測「送出意向」那一格的放棄率（報告 Part 6 方法備註）。
- [ ] 決定是否合併到 main / 開 PR（目前皆未做）。

---

## 5. 接手時務必遵守的設計硬規則

改任何文案前先看這幾條（違反會破壞整個產品邏輯）：

1. **全站禁用詞**：審核、資格、申請條件、追蹤、檢查、監督、合格。
   替換詞：配對、認識、旅程、曬貓、近況。（改完可用 grep 掃一次確認 0 筆）
2. **主 CTA 顏色全站唯一**（暖橘 `#C05621`），一個區塊只有一個主要行動。
3. **測驗一屏一題、每題可跳過、進度用正向句式**（「還差 N 題就能看結果」）。
4. **配對永遠不出現「無符合結果」**，最差也輸出「目前最合拍」＋誠實提醒。
5. **回報預設私密**（只給中途看）、提醒用系統中性語氣、不得用人來催。
6. **信任四錨點**必須都看得見：中途實名、健康護照、透明帳本、無責退回。
7. **觸控目標 ≥ 44px**、對比 ≥ 4.5:1、`prefers-reduced-motion`、可見 focus 樣式。

完整規範見 `cat-adoption-site/PROMPTS.md`（Prompt A 的【UX 與易用性硬規則】段）與 `README.md`。

---

## 6. 一句話交接

網站骨架正確（易用性報告證實高分功能全部踩在「鬆開前端審查感 + 守住後端不退養」兩個閥門上）。**下一步不是加功能，是把 P0 的三句文案補上**——那比再做一個新頁面更能提高領養率。
