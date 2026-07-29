# 台灣認養市場推估與用戶反應模擬 — 產出說明

- `../../台灣認養市場推估與用戶反應模擬.pdf` — 報告(A4,11 頁)
- `report.html` — 報告原始檔
- `market-response.json` — 模擬輸出(含 7 個驅動因子的實測結果)

## 重現

```bash
npm run build && npx vite preview --port 4173 --strictPort &
EXPORT=ux-test/market-report/market-response.json node ux-test/market-response.mjs
```

## 方法要點

滿意度不直接給分,而是拆成 7 個驅動因子在真實網站上實測「有沒有被滿足」,
再依 Persona 權重加權得「需求覆蓋率」,最後乘執行品質係數 0.88(上限 92)換算滿意度。
覆蓋率是實測值;滿意度與 NPS 是推估值。
