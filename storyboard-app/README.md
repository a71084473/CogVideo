# Story · Board — 把故事變成起承轉合分鏡

一個極簡、黑白線框、文藝感的前端原型：使用者輸入（或說出）一段故事，
介面把它拆成「起、承、轉、合」四格電影分鏡表。

支援兩種生成模式：

- **Claude 真實生成**：在介面中設定 Anthropic API key 後，
  由 `claude-opus-4-8` 依你的故事內容真實拆解出四格分鏡。
- **Mock 示範模式**：未設定 key 時，以三組預寫分鏡輪替示範完整流程。

> 這不是把故事變成插畫的工具。畫面中**不會出現主角、臉或身體**——
> 只用房間、街道、窗、雨、海、走廊、門、光影與建築輪廓等背景場景，
> 暗示故事的情緒。

## 技術棧

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- `@anthropic-ai/sdk`（瀏覽器直連 Claude API）

## 快速開始

```bash
cd storyboard-app
npm install
npm run dev      # 開發模式，預設 http://localhost:5173
npm run build    # 產出 dist/
npm run preview  # 預覽 build 結果
```

## 使用流程

1. **Hero 區**：說明產品概念（故事 → 四格分鏡）。
2. **輸入故事**：
   - **文字輸入**：textarea，placeholder 為「說一段你想被記住的故事……」。
   - **聲音輸入**：純前端模擬的錄音流程——
     按下麥克風開始錄音（有呼吸動畫與計時器）→ 點擊方塊停止 →
     顯示「正在把聲音整理成文字……」→ 填入 mock 逐字稿，可再編輯。
3. **生成分鏡**：按下按鈕後模擬 1.4 秒的「拆解」等待，
   然後顯示起承轉合四張分鏡卡片，並自動捲動到結果區。
4. **分鏡卡片**：每張卡片包含——
   - 分鏡階段（起 / 承 / 轉 / 合）與場次編號
   - 一句劇情摘要
   - 背景畫面描述
   - 情緒氛圍
   - 黑白線框場景預覽（純 SVG，僅背景元素）
5. **重新生成**：輪替下一組 mock 分鏡，模擬不同的拆解結果。
6. **複製分鏡表**：把四格分鏡整理成純文字複製到剪貼簿，
   可直接貼進企劃書或筆記。

## Claude API 串接

`src/lib/generateStoryboard.ts` 使用官方 `@anthropic-ai/sdk` 直接從瀏覽器
呼叫 Claude（`claude-opus-4-8`），並以 **structured outputs**
（`output_config.format` + JSON Schema）強制回傳符合 `Storyboard` 型別的
四格分鏡。系統提示詞明確禁止畫面描述出現人物，只允許背景、物件與光影，
並要求從八種線框場景（`SceneType`）中挑選最貼切的一種。

- 在介面底部「設定 API Key」輸入你的 Anthropic API key（`sk-ant-...`）。
- 金鑰只存在瀏覽器 localStorage，不經過任何伺服器；
  SDK 以 `dangerouslyAllowBrowser: true` 直連。
  **正式產品請改用後端代理保護金鑰。**
- 「重新生成」會要求 Claude 採用不同的詮釋角度，得到另一種拆解。
- 錯誤（無效金鑰、rate limit、網路、內容拒絕）都會以線框警示條顯示。

### 沒有 API key？用 claude.ai 模擬體驗

Claude Pro（claude.ai）訂閱與 API 分開計費，無法直接供本原型連線，
但你可以把下面的提示詞貼進 claude.ai 對話，先體驗模型的拆解效果、
調整提示方向，再決定是否開通 API：

```text
你是一位電影分鏡師。我會給你一段個人故事，請把它拆解成「起、承、轉、合」四格電影分鏡表。

嚴格規則：
1. 恰好四格，依序為「起」「承」「轉」「合」。
2. 每格包含：一句劇情摘要（貼合故事具體內容，20 字以內）、背景畫面描述、情緒氛圍（格式如「安靜 · 微微不安」）。
3. 背景畫面只能出現空間、物件、光影與天氣——絕對不能出現人物、臉、身體或剪影。用「空椅子」「未收的信」「門縫的光」這類物件暗示人的存在。
4. 場景從這八種中挑選：窗與雨、空房間與椅子、夜街路燈、長廊、海平線、微開的門與光、山稜小徑、城市輪廓。
5. 給分鏡表一個 2–6 字的詩意片名。
6. 全部使用繁體中文。

我的故事是：
（在這裡貼上你的故事）
```

## Mock 資料

`src/data/mockStoryboards.ts` 內含三組完整分鏡表
（《雨停之前》《往海的方向》《搬家那天》）與一段模擬語音逐字稿。
未設定 API key 時作為示範模式使用；聲音輸入的語音轉文字目前仍為模擬流程。

## 專案結構

```
storyboard-app/
├── index.html
├── tailwind.config.js        # 黑白灰色票、動畫、字體設定
├── src/
│   ├── main.tsx
│   ├── App.tsx               # 流程狀態（輸入 → 生成中 → 結果）
│   ├── index.css             # Tailwind 進入點與紙感底紋
│   ├── types.ts              # Stage / Storyboard / 狀態機型別
│   ├── lib/
│   │   └── generateStoryboard.ts # Claude API 呼叫與 structured outputs
│   ├── data/
│   │   └── mockStoryboards.ts
│   └── components/
│       ├── Hero.tsx           # 首頁 Hero 區
│       ├── StoryInput.tsx     # 文字／聲音切換、錄音模擬、生成按鈕
│       ├── ApiKeySettings.tsx # Anthropic API key 設定（localStorage）
│       ├── StoryboardResult.tsx # 結果區、重新生成、複製分鏡表
│       ├── StoryboardCard.tsx # 單張分鏡卡片
│       └── SceneSketch.tsx    # 8 種黑白線框背景場景 SVG
```

## 視覺原則

- 只用黑、白、灰（`ink #1a1a1a` / `paper #fafaf8` / `line` / `faint`）。
- 細線框（1px border、SVG strokeWidth 0.6–1.4），像鉛筆草圖的排線陰影。
- 大量留白、襯線標題字、寬字距的小型英文標籤。
- 響應式：桌機四欄分鏡，平板兩欄，手機單欄。
- **場景 SVG 一律不畫人物**：`SceneSketch.tsx` 提供
  窗與雨、空房間與椅子、夜街路燈、長廊、海平線、
  微開的門與光、山稜小徑、城市輪廓，共 8 種背景。
