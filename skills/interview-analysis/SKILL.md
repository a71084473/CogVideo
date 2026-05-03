# interview-analysis

## Purpose
將原始訪談逐字稿（或筆記）轉為可行洞察：
- 快速萃取重點與關鍵引述
- 進行主題編碼（thematic coding）
- 產出可執行建議與後續研究假設

## When to use
- 使用者說「幫我分析訪談」、「整理訪談重點」、「做主題分析」
- 有 1 份以上逐字稿，需要統整跨受訪者觀點
- 需要訪談摘要、痛點地圖、需求優先級、洞察報告

## Inputs
最少需要：
1. 訪談內容（逐字稿、筆記、錄音轉寫）
2. 研究目標（例如：找出 onboarding 卡點）

建議補充：
- 受訪者輪廓（角色、年資、區域）
- 訪綱或題目列表
- 分析框架偏好（JTBD、AARRR、NPS driver 等）
- 輸出語言與篇幅

## Workflow
1. **定義分析目標與成功標準**
   - 釐清要回答的 1–3 個核心問題
   - 定義輸出格式（簡報式摘要 / 研究 memo / 表格）

2. **資料清理與切分**
   - 以受訪者為單位分段
   - 標註時間、題目、情境
   - 移除可識別個資（PII）

3. **開放式編碼（Open Coding）**
   - 對每段內容貼上短標籤（例如：信任不足、等待焦慮）
   - 保留原話證據，不過度抽象

4. **軸心編碼（Axial Coding）**
   - 合併近似標籤形成主題
   - 紀錄主題間關聯（原因→行為→結果）

5. **主題驗證與反例檢查**
   - 每個主題至少附 2 則原文證據
   - 主動尋找反例，避免確認偏誤

6. **洞察與建議產出**
   - 每個洞察包含：
     - 現象（What）
     - 原因（Why）
     - 影響（So what）
     - 建議（Now what）

7. **信心等級與限制說明**
   - 標記高/中/低信心
   - 說明樣本偏差、資料缺口與推論限制

## Output contract
預設輸出包含以下區塊：
1. Executive Summary（5–8 點）
2. Top Themes（含證據引述）
3. Pain Points & Opportunities
4. Actionable Recommendations（短中長期）
5. Risks / Unknowns
6. Appendix（編碼表）

## Quality bar
- 不捏造受訪者語句
- 區分「原文事實」與「分析推論」
- 高風險建議要附假設與驗證方案
- 敏感資訊一律匿名

## Prompt starter
可直接使用 `templates/prompt_zh.md` 作為起始提示詞。
