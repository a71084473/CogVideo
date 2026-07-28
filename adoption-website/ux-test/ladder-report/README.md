# 久候動物策略階梯金絲雀 — 產出說明

- `../../久候動物策略階梯測試報告.pdf` — 最終報告(A4,10 頁)
- `report.html` / `shots/` — 報告原始檔與截圖
- `ladder-events.json` — 四階實測產生的 574 筆事件

## 重現

```bash
npm run build && npx vite preview --port 4173 --strictPort &
EXPORT=ux-test/ladder-report/ladder-events.json node ux-test/canary-ladder.mjs
```

## 關鍵發現

S3(預設排序納入等待時間)單獨上線會把久候占比拉到 100%,
但整體預約量從 5 掉到 2。因此新增「整體預約量下降 >10% 即回滾」護欄,
並修正發布順序為 S3 與 S4 綁在一起發布。
