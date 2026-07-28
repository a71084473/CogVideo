# 金絲雀測試報告 — 產出說明

- `../../金絲雀測試報告.pdf` — 最終報告(A4,15 頁,含九個旗標的分組對照截圖與儀表板)
- `report.html` — 報告原始檔;圖片引用 `shots/`
- `shots/` — 由 `../capture-canary-shots.mjs` 自動擷取,未經修圖
- `stage0-events.json` — Stage 0 乾跑產生的 61 筆事件,儀表板截圖載入的即為此檔

## 為什麼不需要建置舊版本

對照組 = 九個旗標全關 = 兩輪 UX 優化前的狀態。
因此 before/after 只需切換分組,不必像前一份報告那樣另開 git worktree。

## 重新產生

```bash
npm install && npm run build
npx vite preview --port 4173 --strictPort &

# Stage 0 乾跑並匯出事件
EXPORT=ux-test/canary-report/stage0-events.json node ux-test/canary-stage0.mjs

# 擷取全部截圖
SHOTS=ux-test/canary-report/shots \
EVENTS=ux-test/canary-report/stage0-events.json \
node ux-test/capture-canary-shots.mjs
```

再以 Playwright 將 `report.html` 列印成 PDF(A4,邊界 16/15/18mm,`printBackground: true`)。
