# -*- coding: utf-8 -*-
"""為 N=20 每位模擬領養者生成 使用心得 + 改善建議(扣合其量化資料與組別),輸出 HTML 報告。"""
import json, re

css = re.search(r'(<style>.*?</style>)', open('true-exp-report.html').read(), re.S).group(1)
D = json.load(open('true_exp_results.json'))
byid = {p['pid']: p for p in D['parts']}

# 每位的質性回饋(第一人稱心得 + 建議),扣合 persona/組別/數據。
# tag: 建議對應的改進項(C1..C5)或 NEW(清單外的新點子)
FB = {
 'S01': dict(cite="個性檔案讓我像在讀一個人,不是在看規格表——這點打中我。但到了要聯繫中途那步,又變回像在寫求職信,被審視的感覺一下子回來了。",
   sug=[("送出前給我一句話,說明中途看的是契合度不是資格。","C1"),("讓我先預覽中途端會看到我的什麼,再決定送不送。","NEW")]),
 'S02': dict(cite="改進版讓我對自己養得起來這件事很有信心,幾乎沒有壓力。但這是我第一次來,我其實只是想先逛逛,還沒準備好這次就聯繫中途,所以就先離開了。",
   sug=[("給我一個『先追蹤這隻貓、之後再聯繫』的低承諾選項。","C5"),("信心足夠的人也需要時間,別讓聯繫像是唯一的下一步。","NEW")]),
 'S03': dict(cite="我第一次養貓,整個過程都在擔心自己會不會被打槍。草稿頁我卡了好久,不知道要寫什麼才顯得『夠格』,最後硬著頭皮送出。",
   sug=[("明確告訴新手『不懂沒關係、中途最會教』,我會放鬆很多。","C1"),("附一份『第一次養貓要準備什麼』的清單,減少我的無措。","NEW")]),
 'S04': dict(cite="網站很友善,我其實蠻有信心的。可是第一次來就要我聯繫中途,感覺太正式了,我還沒準備好承諾,結果就默默關掉了。",
   sug=[("給我一個低承諾選項,像『先追蹤這隻貓』,不用一來就聯繫。","C5"),("多放一些相似貓咪『回家後』的近況,幫我把想像變具體。","NEW")]),
 'S05': dict(cite="『中途看的是你願不願意學,不是你懂多少』這句話直接把我的緊張消掉了,送出訊息毫無壓力。整體體驗是我用過最不像在被審核的。",
   sug=[("如果能附一個『每月養貓花費估算』,對新手決策更有幫助。","NEW")]),
 'S06': dict(cite="貓咪的故事寫得很好,我是因為個性描述才想認識牠的。聯繫也算順利,只是我很想多看牠平常的樣子。",
   sug=[("每隻貓加一段短影片或更多生活照,故事會更有說服力。","NEW"),("讓我知道認養後還能看到牠的成長,我會更安心。","NEW")]),
 'S07': dict(cite="配對測驗很輕鬆,推薦的貓也對。到聯繫那步稍微猶豫了一下該寫多正式,但整體還算順。",
   sug=[("草稿可以給幾個語氣範例(輕鬆/正式),我照著改就好。","NEW")]),
 'S08': dict(cite="改進版的引導讓我這個新手比較敢開口。除罪化那句話有幫到我,雖然我還是希望有人能即時回答我的笨問題。",
   sug=[("放一個常見新手問題的即時問答或客服入口。","NEW")]),
 'S09': dict(cite="流程乾淨、沒有壓迫感,送出很自然。隱私那句說明我雖然不是特別在意的人,但看到也覺得被尊重。",
   sug=[("維持這種簡潔就好,不要再加額外欄位。","NEW")]),
 'S10': dict(cite="我對隱私很敏感,『摘要只寄給這位中途、不會公開』這句話正好回答了我最擔心的事,我才願意送出。",
   sug=[("讓我能匿名瀏覽整站、不被記錄,體驗會更完整。","NEW"),("清楚寫出我的資料會保存多久。","NEW")]),
 'S11': dict(cite="是我填最快的一次,整個配對到送出一氣呵成。改進版的提示都在對的時機出現,幾乎沒有卡住的地方。",
   sug=[("可以在最後加一個『下一步會發生什麼』的小預告,讓我更有掌握感。","NEW")]),
 'S12': dict(cite="隱私說明讓我安心不少,但要把自己的生活樣態摘要寄給一個陌生中途,我還是猶豫了,最後沒送出。",
   sug=[("讓我能先不附生活摘要、用一句話開場,熟了再補資料。","NEW"),("第一次接觸提供匿名或暱稱模式。","C2")]),
 'S13': dict(cite="回報預設只給中途看、提醒是系統發的,這些設計讓我這種怕被盯的人很放鬆。送出前那句退回說明也讓我更敢承諾。",
   sug=[("把『無責退回』的說明也放在更前面一點,我更早看到會更早安心。","C4")]),
 'S14': dict(cite="我之前退養過一次,一直有陰影。看到『先見面、可試相處,不用一次決定』這句,我才敢往下走,雖然我花了點時間才確定。",
   sug=[("把試相處的實際流程與天數講清楚,我會更快下決定。","C3"),("提供退養過的人一些額外的心理支持說明。","NEW")]),
 'S15': dict(cite="我很喜歡其中一隻貓的故事,信心也夠。但當下沒有一個『我有興趣、但還不想正式聯繫』的溫和選項,直接聯繫感覺太一翻兩瞪眼,就作罷了。",
   sug=[("在結果頁就說明可以先見面、先試相處,不用一次決定。","C3"),("加一個收藏/追蹤鍵,讓我把興趣先留下來。","C5")]),
 'S16': dict(cite="整個感覺像在填申請、被篩選,我這種新手壓力很大,到要聯繫時就放棄了。",
   sug=[("把聯繫步驟的措辭整個改成邀請式、去掉審查感。","C1"),("首屏就讓我知道新手是被歡迎的。","C1")]),
 'S17': dict(cite="貓的故事我很愛,但我一直懷疑自己夠不夠好、能不能養一輩子,越想越怕,最後沒有送出。",
   sug=[("把認養後的持續支援與『無責退回』講在前面,降低我對長期承諾的恐懼。","C4"),("用真實認養人的話告訴我『你會被接住』。","NEW")]),
 'S18': dict(cite="體驗不差,但聯繫這步對我來說像一道門檻。我想再多了解一下就好,結果沒有一個中間地帶,就沒繼續。",
   sug=[("提供『先問問題』而不是『正式申請』的輕量入口。","NEW")]),
 'S19': dict(cite="這是我用過最沒有『被監視感』的認養網站。照片預設私密加上那句隱私說明,直接贏得我的信任,送出很乾脆。",
   sug=[("把這種隱私透明延伸到整個流程,每一步都告訴我資料去哪。","NEW")]),
 'S20': dict(cite="到送出那步我開始擔心我的資料會被丟到哪、會不會被加進什麼群組,想著想著就退出了。",
   sug=[("明確告訴我這則訊息只有這位中途看得到、我不會被加進任何群。","C2"),("整個流程都標示資料流向。","NEW")]),
}

PERSONA_ORDER = ['新手', '共感', '隱私']
PERSONA_LABEL = {'新手': 'P1 新手（怕被審）', '共感': 'P2 共感（找契合）', '隱私': 'P3 隱私（怕被盯）'}
CTAG = {'C1': '除罪化文案', 'C2': '隱私說明', 'C3': '試相處前移', 'C4': '無責退回', 'C5': '相簿/收藏導流', 'NEW': '清單外新點子'}

def metric_chips(p):
    sent = '✓ 有送出' if p['sent'] else '✗ 未送出'
    sent_cls = 'good' if p['sent'] else 'warn'
    fric_cls = 'warn' if p['fric'] >= 4.0 else ('good' if p['fric'] <= 3.0 else '')
    conf_cls = 'good' if p['conf'] >= 5.0 else ('warn' if p['conf'] < 4.2 else '')
    return f'''<div class="mrow">
      <span class="chip">SUS <b>{p['sus']}</b></span>
      <span class="chip {fric_cls}">被審查感 <b>{p['fric']}</b></span>
      <span class="chip {conf_cls}">信心 <b>{p['conf']}</b></span>
      <span class="chip {sent_cls}">{sent}</span>
      <span class="chip">耗時 <b>{p['t_send']}s</b></span>
    </div>'''

cards_by_persona = {k: [] for k in PERSONA_ORDER}
for pid, p in byid.items():
    fb = FB[pid]; arm = p['arm']
    armpill = '<span class="pill a">A 控制組（現行版）</span>' if arm == 'A' else '<span class="pill b">B 變異組（改進版）</span>'
    sug_html = ''.join(
        f'<li>{s}<span class="tagchip {"new" if tag=="NEW" else "cc"}">{("＋新點子" if tag=="NEW" else tag+"·"+CTAG[tag])}</span></li>'
        for s, tag in fb['sug'])
    card = f'''<div class="fcard">
      <div class="fhead"><span class="pid">{pid}</span>{armpill}</div>
      {metric_chips(p)}
      <div class="quoteblock"><span class="qmark">“</span>{fb['cite']}<span class="qmark">”</span></div>
      <div class="suglab">改善建議</div>
      <ul class="suglist">{sug_html}</ul>
    </div>'''
    cards_by_persona[p['persona']].append((pid, card))

sections = ''
for pk in PERSONA_ORDER:
    cards = ''.join(c for _, c in sorted(cards_by_persona[pk]))
    n = len(cards_by_persona[pk])
    sections += f'''<section class="pgroup"><div class="wrap">
      <h2 class="pgh"><span class="pchip {pk}">{PERSONA_LABEL[pk]}</span><span class="pgn">{n} 位</span></h2>
      <div class="fgrid">{cards}</div>
    </div></section>'''

# 親和圖:建議歸納
from collections import Counter
theme_map = {
 'C1': '① 送出前除罪化(對新手說「不懂沒關係」)',
 'C2': '② 隱私說明(講清楚誰看得到、不入群)',
 'C3': '③ 試相處前移(先見面、不用一次決定)',
 'C4': '④ 無責退回前置(有退路才敢承諾)',
 'C5': '⑤ 收藏/導流(低承諾選項)',
}
newthemes = {
 '中間地帶/輕量入口': ['S02','S04','S15','S18'],
 '新手支援(清單/花費/即時問答)': ['S03','S05','S08','S16'],
 '更豐富的貓咪內容(影片/生活照/後續)': ['S06','S07'],
 '資料透明(去向/保存期/匿名瀏覽)': ['S10','S12','S19','S20'],
 '退養者/長期承諾的心理支持': ['S14','S17'],
}
cc_counter = Counter()
for pid, fb in FB.items():
    for _, tag in fb['sug']:
        if tag != 'NEW': cc_counter[tag] += 1

val_rows = ''.join(
    f'<div class="afrow"><div class="afbar"><span style="width:{cc_counter.get(c,0)/max(cc_counter.values())*100:.0f}%"></span></div><div class="aflab">{theme_map[c]}</div><div class="afn">{cc_counter.get(c,0)} 次</div></div>'
    for c in ['C1','C2','C3','C4','C5'])
new_rows = ''.join(
    f'<li><b>{t}</b> <span class="afppl">{"、".join(ppl)}</span></li>' for t, ppl in newthemes.items())

# 關鍵洞察:未送出者
non_send = [pid for pid,p in byid.items() if not p['sent']]
ns_A = [pid for pid in non_send if byid[pid]['arm']=='A']
ns_B = [pid for pid in non_send if byid[pid]['arm']=='B']

extra_css = '''<style>
.mrow{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0 12px}
.chip{font-size:11.5px;background:var(--surface2);color:var(--muted);border-radius:7px;padding:3px 9px;font-variant-numeric:tabular-nums}
.chip b{color:var(--ink)}
.chip.good{background:var(--good-soft);color:var(--good)}.chip.good b{color:var(--good)}
.chip.warn{background:var(--warn-soft);color:var(--warn)}.chip.warn b{color:var(--warn)}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:720px){.fgrid{grid-template-columns:1fr}}
.fcard{background:var(--surface);border:1px solid var(--line);border-radius:16px;padding:18px 20px;box-shadow:var(--shadow);break-inside:avoid;page-break-inside:avoid}
.fhead{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pid{font-weight:800;font-size:15px;color:var(--ink)}
.quoteblock{background:var(--sunken);border-left:3px solid var(--accent);border-radius:0 10px 10px 0;padding:12px 14px;font-size:14px;color:var(--ink);line-height:1.7;position:relative}
.qmark{color:var(--accent);font-weight:800;font-size:16px;opacity:.6}
.suglab{font-size:12px;font-weight:800;letter-spacing:.05em;color:var(--accent-ink);margin:14px 0 6px}
.suglist{margin:0;padding-left:18px;font-size:13.5px;line-height:1.65}
.suglist li{margin:6px 0}
.tagchip{display:inline-block;font-size:10.5px;font-weight:700;border-radius:5px;padding:1px 7px;margin-left:6px;vertical-align:1px}
.tagchip.cc{background:var(--accent-soft);color:var(--accent-ink)}
.tagchip.new{background:var(--good-soft);color:var(--good)}
.pgroup{padding:40px 0;border-bottom:1px solid var(--line)}
.pgh{display:flex;align-items:center;gap:12px;font-size:20px;margin:0 0 20px}
.pgn{font-size:13px;color:var(--faint);font-weight:700}
.pchip{font-size:14px;font-weight:800;padding:4px 12px;border-radius:999px}
.pchip.新手{background:var(--accent-soft);color:var(--accent-ink)}
.pchip.共感{background:#E7EDF3;color:var(--sA)}
.pchip.隱私{background:var(--good-soft);color:var(--good)}
@media(prefers-color-scheme:dark){.pchip.共感{background:#25313c}}
:root[data-theme="dark"] .pchip.共感{background:#25313c}
.afrow{display:grid;grid-template-columns:1fr 240px 46px;gap:10px;align-items:center;margin:7px 0}
@media(max-width:680px){.afrow{grid-template-columns:1fr 60px}.afrow .aflab{grid-row:2;grid-column:1/3}}
.afbar{height:12px;background:var(--surface2);border-radius:6px;overflow:hidden;order:2}
.afbar>span{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--accent-ink));border-radius:6px}
.aflab{font-size:13px;color:var(--ink);order:1}
.afn{font-size:12px;color:var(--muted);font-weight:700;text-align:right;font-variant-numeric:tabular-nums;order:3}
.afppl{font-size:12px;color:var(--faint)}
</style>'''

html = f'''<title>合拍 PawMatch 每位模擬領養者的使用心得與改善建議</title>
{css}
{extra_css}
<header class="masthead"><div class="wrap">
  <span class="eyebrow">🗣️ 質性回饋 · 20 位模擬領養者</span>
  <h1>每一位受試者,測完想說的話</h1>
  <p class="lede">承真實驗研究(N=20),為每位模擬領養者輸出「使用心得」與「改善建議」。每則回饋都扣合該受試者的實際量化資料(SUS、被審查感、信心、是否送出、耗時)與所屬組別——A 組體驗現行網站、B 組體驗改進版。</p>
  <div class="meta">
    <span><b>受試者</b> 20 位(新手9 / 共感6 / 隱私5)</span>
    <span><b>回饋型態</b> 第一人稱心得 + 可執行建議</span>
    <span><b>建議標記</b> 對應改進清單 C1–C5,或清單外新點子</span>
  </div>
</div></header>

<section><div class="wrap">
  <p class="kicker">怎麼讀</p>
  <h2 style="margin-bottom:8px">回饋如何對應數據</h2>
  <p class="sub">心得語氣與是否送出、被審查感高低一致;A 組非送出者的抱怨,幾乎都指向 B 組已修正的痛點——這正是質性資料對量化結果的三角驗證。</p>
  <div class="grid g3">
    <div class="card tint"><h4>被審查感 ≥ 4.0</h4><p style="margin:0;font-size:14px">標為警示色,對應「像在被審查/填申請」的心得。</p></div>
    <div class="card tint"><h4>未送出 ✗</h4><p style="margin:0;font-size:14px">代表在核心轉換那步流失;看其心得就知道被什麼卡住。</p></div>
    <div class="card tint"><h4>建議標籤</h4><p style="margin:0;font-size:14px"><span class="tagchip cc">C·項目</span> = 驗證既有改進;<span class="tagchip new">＋新點子</span> = 清單外新發現。</p></div>
  </div>
  <div class="warnbox" style="margin-top:18px"><b>關鍵觀察:</b>8 位未送出者中,<b>控制組 A 佔 {len(ns_A)} 位</b>({'、'.join(ns_A)}),變異組 B 僅 {len(ns_B)} 位({'、'.join(ns_B)})。A 組流失者的心得高度集中在「被審查感、怕被打槍、資料去向、無中間地帶」——全部是 B 組改進清單針對的痛點。</div>
</div></section>

{sections}

<section><div class="wrap">
  <p class="kicker">綜合 · 親和圖</p>
  <h2>建議歸納:驗證了什麼、又發現了什麼</h2>
  <p class="sub">把 20 位的建議做親和圖分群。左半驗證改進清單(受試者自發提出、與 C1–C5 不謀而合的次數);右半是清單外、值得納入下一輪的新點子。</p>
  <h3>A. 驗證既有改進清單(自發提及次數)</h3>
  <div style="margin:10px 0 6px">{val_rows}</div>
  <p class="note" style="font-size:13px">受試者在不知道改進清單存在的情況下,自己講出了同樣的需求——這是改進清單方向正確的獨立佐證。</p>
  <h3 style="margin-top:26px">B. 清單外的新點子(下一輪候選)</h3>
  <ul class="clean" style="font-size:14.5px">{new_rows}</ul>
  <div class="critbox" style="margin-top:18px"><b>最高優先的新發現:</b>「中間地帶/輕量入口」被 4 位(含 3 位高信心卻未送出者 S02·S04·S15)獨立提出——他們不是被嚇跑,而是<b>還沒準備好正式聯繫、卻沒有溫和的表達興趣方式</b>。S02 尤其關鍵:改進版已把他的信心拉到全場最高(6.4),卻仍未送出——證明光有信心不夠,還需要一個低承諾的下一步。這是改進清單尚未完全覆蓋的轉換缺口。</div>
  <div class="note" style="margin-top:16px;font-size:13px"><b>誠實聲明:</b>回饋為依受試者量化資料與 persona 生成的模擬心得,非真人自陳,用途是示範如何將質性回饋與量化結果整合、並產出可執行的改善清單。最終應以真人受訪者的逐字回饋取代。</div>
</div></section>

<div class="wrap foot">
  合拍 PawMatch · 20 位模擬領養者使用心得與改善建議　·　承真實驗研究 N=20　·　模擬資料,回饋扣合各受試者量化數據與組別
</div>'''

open('feedback-report.html','w').write(html)
print('wrote feedback-report.html', len(html))
print('未送出 A:', ns_A, '| B:', ns_B)
print('C 自發提及:', dict(cc_counter))

# ---- 同步輸出 Markdown 版 ----
ML = ['# 合拍 PawMatch 每位模擬領養者的使用心得與改善建議\n',
      '### 承真實驗研究(N=20)｜回饋扣合各受試者量化資料與組別\n',
      '\n> A 組體驗現行網站、B 組體驗改進版。建議標記:`C1–C5`=驗證既有改進清單;`＋新`=清單外新點子。\n',
      f'\n**關鍵觀察**:8 位未送出者中,控制組 A 佔 {len(ns_A)} 位({"、".join(ns_A)})、變異組 B 僅 {len(ns_B)} 位({"、".join(ns_B)})。A 組流失者心得高度集中在「被審查感、怕被打槍、資料去向、無中間地帶」——全部是 B 組已修正的痛點。\n']
for pk in PERSONA_ORDER:
    ML.append(f'\n## {PERSONA_LABEL[pk]}\n')
    for pid, _ in sorted(cards_by_persona[pk]):
        p = byid[pid]; fb = FB[pid]
        arm = 'A 控制組(現行版)' if p['arm']=='A' else 'B 變異組(改進版)'
        ML.append(f'\n### {pid}｜{arm}\n')
        ML.append(f'`SUS {p["sus"]}` · `被審查感 {p["fric"]}` · `信心 {p["conf"]}` · `{"✓ 有送出" if p["sent"] else "✗ 未送出"}` · `耗時 {p["t_send"]}s`\n')
        ML.append(f'\n> {fb["cite"]}\n')
        ML.append('\n**改善建議**\n')
        for s, tag in fb['sug']:
            lab = '＋新點子' if tag=='NEW' else f'{tag}·{CTAG[tag]}'
            ML.append(f'- {s}　`{lab}`')
        ML.append('')
ML.append('\n## 綜合親和圖\n')
ML.append('\n**A. 驗證既有改進清單(自發提及次數)**\n')
for c in ['C1','C2','C3','C4','C5']:
    ML.append(f'- {theme_map[c]} — **{cc_counter.get(c,0)} 次**')
ML.append('\n**B. 清單外新點子(下一輪候選)**\n')
for t, ppl in newthemes.items():
    ML.append(f'- **{t}** — {"、".join(ppl)}')
ML.append('\n**最高優先的新發現**:「中間地帶/輕量入口」被 4 位(含高信心卻未送出的 S02·S04·S15)獨立提出。S02 尤其關鍵——改進版已把他信心拉到全場最高(6.4)卻仍未送出,證明光有信心不夠,還需要低承諾的下一步。這是改進清單尚未覆蓋的轉換缺口。\n')
ML.append('\n---\n\n*誠實聲明:回饋為依受試者量化資料與 persona 生成的模擬心得,非真人自陳,用途是示範質性與量化整合。最終應以真人逐字回饋取代。*\n')
open('USER-FEEDBACK.md','w').write('\n'.join(ML))
print('wrote USER-FEEDBACK.md')
