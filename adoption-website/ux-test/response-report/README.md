# 進入市場後的用戶反應模擬報告 — 產出說明

- `../../用戶反應模擬報告.pdf` — 報告(A4,12 頁,含七個驅動因子的網頁設計對照截圖)
- `report.html` / `shots/` — 報告原始檔與截圖

## 截圖對照的是什麼

七個滿意度驅動因子,每一個都對應網站上一塊具體設計。
對照組(旗標全關)= 現況市場的體驗;金絲雀組 = 本平台的設計。
每組皆為同一網址、同一視窗尺寸,僅切換分組或發布階段。

| 因子 | 對應設計 | 截圖 |
|---|---|---|
| D1 不被審判 | 信任頁「我們這邊的實話」 | d1-off / d1-on |
| D2 資訊完整 | 動物頁「可能不適合」+ 支出揭露 | d2-both(基準即滿足) |
| D3 不被監視 | 90 天頁「這不是在盯著你」 | d3-off / d3-on |
| D4 流程不繁瑣 | 測驗第 6 題中途回饋 | d4-off / d4-on |
| D5 有人幫 | 危機求助頁七情境 | d5-both(基準即滿足) |
| D6 負擔得起 | 久候動物支持包(僅 S4) | d6-off / d6-on |
| D7 說得動家人房東 | 流程頁給房東/家人的說明 | d7-off / d7-on |

## 重現

```bash
npm run build && npx vite preview --port 4173 --strictPort &
node ux-test/market-response.mjs            # 模擬
SHOTS=ux-test/response-report/shots node ux-test/capture-driver-shots.mjs   # 截圖
```
