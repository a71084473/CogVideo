# 領養意願 UX 體驗測試報告 — 產出說明

- `../../UX測試報告.pdf` — 最終報告(A4,15 頁,含全部修改前後截圖)
- `report.html` — 報告原始檔;圖片引用 `shots/`
- `shots/` — 由 `../capture-shots.mjs` 自動擷取的實際畫面,未經修圖

## 重新產生報告

需要同時服務「優化前」與「優化後」兩個版本:

```bash
# 優化前(commit 2bc54d9)
git worktree add /tmp/before 2bc54d9
cd /tmp/before/adoption-website && npm i && npm run build
npx vite preview --port 4174 --strictPort &

# 優化後(目前版本)
cd <repo>/adoption-website && npm run build
npx vite preview --port 4173 --strictPort &

# 擷取截圖
SHOTS=ux-test/report/shots node ux-test/capture-shots.mjs
```

再以 Playwright 將 `report.html` 列印成 PDF(A4,邊界 16/15/18mm,`printBackground: true`)。
