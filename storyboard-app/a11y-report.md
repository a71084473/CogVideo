# 無障礙檢測報告 — 記憶藝廊 Memory · Gallery

**標準**：WCAG 2.1 Level AA
**受測對象**：`storyboard-app`（React 18 + TypeScript + Vite + Tailwind CSS，SPA 單頁多狀態）
**最後更新**：2026-08-01
**最終狀態**：✅ **全數通過** — axe-core 0 violations、Lighthouse Accessibility 100、人工檢核 13/13

---

## 1. 測試環境與工具

| 項目 | 內容 |
| --- | --- |
| 啟動指令 | `npm run dev`（http://localhost:5173）／`npm run preview`（http://localhost:4173，production build） |
| 自動化引擎 | **axe-core 4.x**，tags = `wcag2a, wcag2aa, wcag21a, wcag21aa` |
| 效能／稽核 | **Lighthouse**（`--only-categories=accessibility`），Chromium 預裝於 `/opt/pw-browsers/chromium` |
| 驅動方式 | Playwright（注入 axe-core 至各 UI 狀態） |

### 工具替代說明（重要）

原訂使用 `npx @axe-core/cli`，但其相依套件 `chromedriver` 於安裝階段需連線
`googlechromelabs.github.io`，該網域被本環境的網路政策封鎖（CONNECT 403），安裝失敗。

因此改為**直接注入 `axe-core` 引擎執行**——`@axe-core/cli` 本身即是此引擎的命令列包裝，
規則集、tag 篩選與 violation 輸出格式完全一致，**判定標準未降低**。
此外實際採用的 tag 比原指令多了 `wcag21a` 與 `wcag21aa`（更嚴格，完整涵蓋 WCAG 2.1）。

---

## 2. 受測路由

本專案無 router，為單頁多狀態 SPA，因此將**每個 UI 狀態視為一條路由**逐一掃描，
共 **9 個狀態 × 2 種視窗寬度 = 11 組**組合（部分狀態僅測桌機）：

| # | 狀態 ID | 說明 | 桌機 1280px | 手機 390px |
| --- | --- | --- | :---: | :---: |
| 1 | `home-text` | 首頁 · 文字輸入模式（預設） | ✓ | ✓ |
| 2 | `home-voice-idle` | 聲音輸入模式 · 待錄音 | ✓ | — |
| 3 | `voice-recording` | 聲音輸入 · 錄音中 | ✓ | — |
| 4 | `voice-transcribing` | 聲音輸入 · 轉文字中 | ✓ | — |
| 5 | `voice-done` | 聲音輸入 · 轉文字完成（可編輯） | ✓ | — |
| 6 | `apikey-panel` | API Key 設定面板展開 | ✓ | — |
| 7 | `generating` | 生成中 · 載入狀態 | ✓ | — |
| 8 | `result` | 生成結果 · 起承轉合四幕（畫框） | ✓ | ✓ |
| 9 | `error` | 錯誤狀態 · `role="alert"` 警示條 | ✓ | — |

---

## 3. 違規清單與修正

嚴重程度依 axe impact 分級：`critical` > `serious` > `moderate` > `minor`。

### 3.1 自動化工具偵測（axe-core / Lighthouse）

| ID | 檔案：行號 | WCAG | 嚴重度 | 問題 | 修正 | 狀態 |
| --- | --- | --- | --- | --- | --- | --- |
| A-01 | `tailwind.config.js:19` | 1.4.3 對比（最低） | serious | 次要文字色 `faint: #8a8a85` 對背景 `#fafaf8` 僅 **3.32:1**，未達一般文字 4.5:1。全站 `text-faint` 受影響，**9 個狀態共 119 個節點** | 改為 `#6f6f6a`，對比 **4.83:1** | ✅ resolved |
| A-02 | `src/components/StoryInput.tsx:160` | 4.1.2 名稱、角色、值 | **critical** | 語音轉檔完成後的 `<textarea>` 無任何關聯標籤（無 label／aria-label／placeholder） | 新增 `<label htmlFor="story-voice">`，並將原本的說明文字改為該 label | ✅ resolved |
| A-03 | `src/App.tsx:52` | 1.3.1 資訊與關聯 | moderate | 文件缺少 `main` 地標，輔助科技無法跳至主要內容（Lighthouse `landmark-one-main`） | 以 `<main>` 包裹輸入區與結果區 | ✅ resolved |

### 3.2 人工程式碼稽核（自動化測不到的部分）

| ID | 檔案：行號 | WCAG | 嚴重度 | 問題 | 修正 | 狀態 |
| --- | --- | --- | --- | --- | --- | --- |
| M-01 | `src/components/StoryboardCard.tsx:33,38` | 1.3.1 | moderate | 標題層級跳級：區塊為 `h2`，卡片內直接使用 `h4`（缺 `h3`）；且「背景畫面／情緒氛圍」本質是欄位名稱而非標題 | 卡片階段改為 `h3`（銜接 `h2`），欄位改用 `<dl>/<dt>/<dd>` 語意 | ✅ resolved |
| M-02 | `src/components/SceneSketch.tsx:23` | 1.1.1 非文字內容 | moderate | SVG 的 `aria-label` 為機器代碼（`場景草圖：window-rain`），螢幕閱讀器會朗讀英文代號 | 新增 `SCENE_LABELS` 對照表，改讀「黑白線框場景草圖：窗與雨」 | ✅ resolved |
| M-03 | `src/components/StoryInput.tsx:211` | 1.1.1 | minor | 麥克風圖示 SVG 未標記為裝飾，會被輔助科技重複朗讀（按鈕已有 `aria-label`） | 加上 `aria-hidden="true"` 與 `focusable="false"` | ✅ resolved |
| M-04 | `src/components/StoryInput.tsx:77–95` | 4.1.2 | serious | 使用 `role="tablist"`／`role="tab"` 但缺少 `tabpanel`、`aria-controls`，也未實作方向鍵／Home／End 的 tab 鍵盤模式，ARIA 契約不完整 | 改為 `role="group"` + `aria-pressed` 切換按鈕，語意正確且無額外鍵盤模式義務 | ✅ resolved |
| M-05 | `src/components/StoryInput.tsx:99–105` | 3.3.2 標籤或說明<br>4.1.2 | serious | 主要 `<textarea>` 僅以 `placeholder` 當標籤；輸入後標籤即消失，且非可靠的可及名稱來源 | 新增 `sr-only` 的 `<label htmlFor="story-text">`，保留原 placeholder 作為提示 | ✅ resolved |
| M-06 | `src/components/StoryInput.tsx:104,164`<br>`src/components/ApiKeySettings.tsx:50` | 2.4.7 焦點可見 | serious | `focus:outline-none` 移除瀏覽器預設焦點外框，僅以邊框變色替代，鍵盤使用者不易辨識焦點位置 | 移除所有 `focus:outline-none`；於 `index.css` 建立全站 `:focus-visible` 規則（3px `#1a1a1a` 外框 + 2px offset，對比 16.65:1） | ✅ resolved |
| M-07 | `tailwind.config.js:18` | 1.4.11 非文字對比 | serious | 表單控制項邊界使用 `line: #c9c9c4`，對背景僅 **1.59:1**，未達 UI 元件所需的 3:1，使用者難以辨識輸入框範圍 | 新增專用 token `field: #8a8a85`（**3.32:1**）套用於 textarea／input／錄音面板／次要按鈕邊界；`line` 保留給純裝飾分隔線（依規範豁免） | ✅ resolved |
| M-08 | `src/components/StoryInput.tsx`（錄音／轉檔／生成狀態） | 4.1.3 狀態訊息 | serious | 「錄音中」「正在把聲音整理成文字」「生成中」等狀態變化未經 live region 播報，螢幕閱讀器使用者無從得知進度 | 新增常駐 `role="status"` 的 `sr-only` 區塊，依狀態播報訊息；**刻意排除每秒跳動的計時器**避免不斷打斷 | ✅ resolved |
| M-09 | `src/components/StoryboardResult.tsx:91` | 4.1.3 | moderate | 「已複製 ✓」僅為按鈕文字變化，未播報 | 新增 `role="status"` 播報「分鏡表已複製到剪貼簿」 | ✅ resolved |
| M-10 | `src/components/ApiKeySettings.tsx:24–36` | 4.1.2 | moderate | 展開／收合面板的按鈕缺 `aria-expanded` 與 `aria-controls`，狀態未傳達；面板內的輸入欄未包在 `<form>` 中，無法以 Enter 送出 | 補上 `aria-expanded`／`aria-controls`／`aria-describedby`；面板改為 `<form onSubmit>`，支援 Enter 儲存 | ✅ resolved |
| M-11 | `src/index.css:2–10` | 1.4.4 調整文字大小 | moderate | `html { font-size: 17px }` 以絕對 px 覆寫根字級，會**覆蓋使用者在瀏覽器設定的字級偏好**（對年長使用者影響尤大） | 改為百分比 `106.25%` / `112.5%`，視覺結果相同但保留使用者偏好縮放 | ✅ resolved |
| M-12 | `src/index.css` | 2.3.3 互動動態<br>2.2.2 暫停停止隱藏 | minor | 錄音呼吸動畫、卡片淡入動畫無視 `prefers-reduced-motion`；生成後的 `scrollIntoView({behavior:'smooth'})` 亦然 | 新增 `@media (prefers-reduced-motion: reduce)` 全域停用動畫；`App.tsx` 依偏好切換為 `behavior: 'auto'` | ✅ resolved |
| M-13 | `src/App.tsx` | 2.4.1 略過區塊 | minor | 無略過機制，鍵盤使用者每次都得穿過整段 Hero 才能到輸入區 | 新增 sr-only 的略過連結（聚焦時顯示），可直接跳至 `#input` | ✅ resolved |
| M-14 | `src/components/StoryInput.tsx:64`<br>`src/components/StoryboardResult.tsx:47` | 1.3.1 | minor | `<section>` 無可及名稱，不會被視為 region 地標，輔助科技無法列出 | 兩區塊補上 `aria-labelledby` 指向各自的 `h2` | ✅ resolved |
| M-15 | `src/components/StoryboardCard.tsx:19,33,38`<br>`src/App.tsx:71` | 1.4.4 | minor | `text-[10px]` 使用絕對 px，不隨根字級縮放；對主要使用者（年長者）而言過小 | 改用 rem 基準的 `text-xs`（≈12.75–13.5px） | ✅ resolved |

**合計：18 項違規，18 項已修正，0 項未解決，0 項 BLOCKED。**

---

## 4. 色彩對比實測（對背景 `paper #fafaf8`）

| 用途 | 色值 | 對比 | 門檻 | 結果 |
| --- | --- | --- | --- | --- |
| 主要文字 `ink` | `#1a1a1a` | **16.65:1** | 4.5:1 | ✅ |
| 次要文字 `faint`（修正後） | `#6f6f6a` | **4.83:1** | 4.5:1 | ✅ |
| ~~次要文字 `faint`（修正前）~~ | ~~`#8a8a85`~~ | ~~3.32:1~~ | 4.5:1 | ❌ → 已修正 |
| 描述文字 `neutral-600` | `#525252` | **7.48:1** | 4.5:1 | ✅ |
| 表單控制項邊界 `field` | `#8a8a85` | **3.32:1** | 3:1（1.4.11） | ✅ |
| 主要按鈕文字（`paper` on `ink`） | `#fafaf8` / `#1a1a1a` | **16.65:1** | 4.5:1 | ✅ |
| 焦點外框（`ink` on `paper`） | `#1a1a1a` | **16.65:1** | 3:1（1.4.11） | ✅ |
| 裝飾分隔線 `line` | `#c9c9c4` | 1.59:1 | — | ✅ 純裝飾，依 1.4.11 豁免 |

---

## 5. 人工檢核結果（13/13 通過）

| WCAG | 檢核項目 | 結果 |
| --- | --- | --- |
| 1.3.1 | 標題層級不跳級 | ✅ H1×1 › H2 說一段您的回憶 › H2 回憶的四幕 › H3×4（起承轉合） |
| 1.3.1 / 2.4.1 | landmark 結構（main/header/footer + 具名 region） | ✅ main=1, header=1, footer=1, region=[input, result] |
| 1.1.1 | 所有 img/svg 有替代文字或標記為裝飾 | ✅ 全數通過（含機器代碼 aria-label 檢查） |
| 1.3.1 / 3.3.2 / 4.1.2 | 表單控制項皆有關聯 label | ✅ 全數通過 |
| 2.4.7 | 每個可聚焦元件皆有可見焦點指示 | ✅ 輸入狀態 8 個、結果狀態 8 個元件全數具可見外框 |
| 2.1.2 | 無鍵盤陷阱 | ✅ Tab 可完整走訪並離開文件 |
| 1.3.2 / 2.4.3 | Tab 順序符合視覺順序 | ✅ 8 個元件 DOM 序與版面序一致 |
| 2.1.1 | 可純以鍵盤完成核心流程 | ✅ Tab + Enter 成功觸發生成並顯示結果 |
| 1.4.10 | Reflow：320px 寬無水平捲動 | ✅ scrollWidth 320 = clientWidth 320 |
| 1.4.4 | 200% 縮放（視窗減半）無水平捲動 | ✅ scrollWidth 640 = clientWidth 640 |
| 1.4.4 | 字級放大至 200% 內容不遺失 | ✅ scrollWidth 1280 = clientWidth 1280 |
| 3.1.1 / 2.4.2 | 頁面語言與標題已宣告 | ✅ `lang="zh-Hant"`、title 完整 |
| 2.3.3 / 2.2.2 | 尊重 prefers-reduced-motion | ✅ 動畫時長降為 ~0s |

---

## 6. 迴圈紀錄

| Round | new_issues | resolved | open | blocked | 說明 |
| --- | --- | --- | --- | --- | --- |
| 1 | 18 | 18 | 0 | 0 | axe 120 nodes（color-contrast 119、label 1）+ Lighthouse `landmark-one-main` + 15 項人工稽核；全數修正後複驗歸零 |
| 2 | 0 | 0 | 0 | 0 | 對 **production build** 複驗，並補測先前未涵蓋的 `generating`／`error` 兩狀態；11 組全數 0 violations，Lighthouse 100，人工 13/13 → **收斂** |

### 測試工具本身的修正（非產品缺陷，記錄以示透明）

Round 1 複驗時發現自建測試腳本有兩處瑕疵，已修正後才採信結果：

1. **焦點測試涵蓋不足**：`blur()` 不會重設 Chromium 的「循序焦點導覽起點」，導致 Tab 只走到 2 個元件就中止。改為讓 `body` 實際取得焦點後重測，涵蓋數由 2 → 8。
2. **reduced-motion 判定誤報**：Chromium 將 `0.001ms` 正規化為 `1e-06s`，原本的字串比對誤判為失敗，改為數值比較。

---

## 7. 終止條件核對

| 條件 | 狀態 |
| --- | --- |
| axe 對所有路由回報 0 violations | ✅ 11 組全數 0 |
| Lighthouse 對所有路由回報 0 violations | ✅ 100 分，0 failing audits，22 項通過 |
| 手動程式碼檢核項目全數通過 | ✅ 13/13 |
| 報告中所有 issue 狀態皆為 resolved | ✅ 18/18 |
| 最近一輪未新增任何違規（收斂） | ✅ Round 2 新增 0 |

**→ 終止條件全部滿足，檢測結束。**

---

## 8. 未破壞功能之驗證

每輪修改後皆確認：

- `npx tsc --noEmit` 型別檢查通過、`npm run build` 建置成功
- dev server 與 preview server 皆正常回應 200
- 核心流程實測正常：文字輸入 → 生成分鏡 → 四幕畫框結果（示範資料《裁縫車的歌》正確渲染）
- 語音模擬流程（錄音 → 停止 → 轉文字 → 可編輯）四個狀態皆正常
- 極簡黑白線框的視覺風格完整保留；畫框與作品銘牌未受影響

## 9. 後續建議（非 AA 必要項，供未來參考）

- **2.4.11 焦點外觀**（WCAG 2.2 AA）：目前 3px 實心外框已超出 2.2 的最低要求，若日後升級至 2.2 可直接沿用。
- **1.4.12 文字間距**：`tracking-widest2`（0.35em）用於中文短標籤，建議未來避免用於長句。
- 真實串接語音輸入時，需為錄音權限請求與失敗情境補上等效的 `role="alert"` 提示。
