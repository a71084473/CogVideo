# Story · Board — 把故事變成起承轉合分鏡

一個極簡、黑白線框、文藝感的前端原型：使用者輸入（或說出）一段故事，
介面把它拆成「起、承、轉、合」四格電影分鏡表。

> 這不是把故事變成插畫的工具。畫面中**不會出現主角、臉或身體**——
> 只用房間、街道、窗、雨、海、走廊、門、光影與建築輪廓等背景場景，
> 暗示故事的情緒。

## 技術棧

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3

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

## Mock 資料

`src/data/mockStoryboards.ts` 內含三組完整分鏡表
（《雨停之前》《往海的方向》《搬家那天》）與一段模擬語音逐字稿。
真實產品只需把 `App.tsx` 中的 `generate()` 換成 AI API 呼叫，
回傳符合 `Storyboard` 型別的資料即可。

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
│   ├── data/
│   │   └── mockStoryboards.ts
│   └── components/
│       ├── Hero.tsx           # 首頁 Hero 區
│       ├── StoryInput.tsx     # 文字／聲音切換、錄音模擬、生成按鈕
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
