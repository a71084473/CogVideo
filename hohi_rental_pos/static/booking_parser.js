/* 預約文字辨識：把客戶傳來的 LINE / Email / 表單文字轉成出租單欄位。
 * parseBooking(text, equipment, today)
 *   equipment: [{id, name}]   today: "YYYY-MM-DD"
 * 回傳 { fields: {company, contact, email, phone, channel, rental_start, rental_end, pickup_at, return_at, note},
 *        items: [{equipment_id, qty, source}], unmatched: [文字片段] }
 * 只會回傳辨識到的欄位；沒辨識到的不會出現在 fields 裡。
 */
(function (root) {
  "use strict";
  const pad = (n) => String(n).padStart(2, "0");
  const CN = { 零: 0, 〇: 0, 一: 1, 二: 2, 兩: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10 };

  function cnNum(s) {
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    if (s === "十") return 10;
    let m = s.match(/^([一二兩两三四五六七八九])?十([一二三四五六七八九])?$/);
    if (m) return (m[1] ? CN[m[1]] : 1) * 10 + (m[2] ? CN[m[2]] : 0);
    return s.length === 1 && s in CN ? CN[s] : NaN;
  }

  function normalize(text) {
    return text
      .replace(/[０-９]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/[Ａ-Ｚａ-ｚ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/＠/g, "@").replace(/．/g, ".").replace(/／/g, "/").replace(/－|—|–/g, "-")
      .replace(/～|〜/g, "~").replace(/：/g, ":").replace(/＊/g, "*").replace(/（/g, "(").replace(/）/g, ")")
      .replace(/\r/g, "");
  }

  // ---- 日期與時間
  // 年份：西元 4 碼、民國 3 碼（115/1/3），或 2~3 碼加「年」
  const DATE_RE = /(?:(\d{4}(?=\s*[\/\-.年])|\d{3}(?=\s*[\/.年])|\d{2,3}(?=\s*年))\s*[\/\-.年]\s*)?(\d{1,2})\s*[\/\-.月]\s*(\d{1,2})(?:\s*(?:日|號))?/g;

  function fixYear(y, m, d, today) {
    const t = new Date(today + "T00:00");
    if (y) {
      y = parseInt(y, 10);
      if (y < 200) y += 1911;            // 民國年
      else if (y < 1000) y += 2000;
      return `${y}-${pad(m)}-${pad(d)}`;
    }
    let yy = t.getFullYear();
    const cand = new Date(yy, m - 1, d);
    if ((t - cand) / 86400000 > 60) yy += 1;   // 沒寫年份且已過很久 → 視為明年
    return `${yy}-${pad(m)}-${pad(d)}`;
  }

  function validDate(m, d) { return m >= 1 && m <= 12 && d >= 1 && d <= 31; }

  function findDates(s, today) {
    const out = [];
    DATE_RE.lastIndex = 0;
    let m;
    while ((m = DATE_RE.exec(s))) {
      const mo = +m[2], d = +m[3];
      if (!validDate(mo, d)) continue;
      // 避開電話號碼、時間（例如 10:30）
      const before = s[m.index - 1] || "", after = s[m.index + m[0].length] || "";
      if (/\d/.test(before) || /\d/.test(after)) continue;
      out.push({ date: fixYear(m[1], mo, d, today), index: m.index, end: m.index + m[0].length, month: mo });
    }
    return out;
  }

  function findTime(s) {
    let m = s.match(/(凌晨|清晨|早上|上午|中午|下午|傍晚|晚上|晚間|AM|PM|am|pm)?\s*(\d{1,2})\s*[:點时時]\s*(\d{1,2}|半)?\s*(分)?\s*(AM|PM|am|pm)?/);
    if (!m) return null;
    let h = parseInt(m[2], 10);
    const min = m[3] === "半" ? 30 : m[3] ? parseInt(m[3], 10) : 0;
    const period = (m[1] || m[5] || "").toLowerCase();
    if (/下午|傍晚|晚上|晚間|pm/.test(period) && h < 12) h += 12;
    if (/中午/.test(period) && h < 6) h += 12;
    if (/凌晨|清晨/.test(period) && h === 12) h = 0;
    if (h > 23 || min > 59) return null;
    return `${pad(h)}:${pad(min)}`;
  }

  // 「11/20~11/22」「11/20-22」「11月20日到22日」
  function findRange(s, today) {
    const ds = findDates(s, today);
    if (ds.length >= 2) return [ds[0].date, ds[ds.length - 1].date];
    if (ds.length === 1) {
      const rest = s.slice(ds[0].end);
      const m = rest.match(/^\s*(?:~|-|至|到|－)\s*(\d{1,2})\s*(?:日|號)?(?!\s*[\/\-.月\d])/);
      if (m) {
        const [y, mo] = ds[0].date.split("-");
        return [ds[0].date, `${y}-${mo}-${pad(m[1])}`];
      }
      return [ds[0].date, null];
    }
    return [null, null];
  }

  function dateTimeFrom(s, today) {
    const ds = findDates(s, today);
    const rest = ds.length ? s.slice(0, ds[0].index) + " " + s.slice(ds[0].end) : s;
    return { date: ds.length ? ds[0].date : null, time: findTime(rest) };
  }

  // ---- 欄位標籤
  const LABELS = [
    ["email", /^(e-?mail|email|mail|信箱|電子郵件|電郵|郵件)/i],
    ["phone", /^(聯絡電話|連絡電話|手機號碼|手機|電話|聯絡方式|tel|phone|mobile)/i],
    ["company", /^(公司名稱|公司名|公司|單位名稱|單位|抬頭|發票抬頭|客戶名稱|客戶|團體名稱|團體|主辦單位)/i],
    ["contact", /^(聯絡人|連絡人|聯絡窗口|窗口|承辦人|負責人|姓名|名字|預約人|訂購人|租借人)/i],
    ["pickup", /^(取貨時間|取貨日期|取貨|取件時間|取件|領取時間|領取|自取時間|自取|送達時間|送貨時間|到貨時間)/i],
    ["return", /^(歸還時間|歸還日期|歸還|還貨時間|還貨|退還|回收時間|收回時間|還件)/i],
    ["period", /^(租借日期|租借期間|租借時間|租期|出租時間|出租日期|出租期間|使用日期|使用時間|活動日期|活動時間|日期|時間)/i],
    ["items", /^(租借設備|租借項目|租借品項|出租設備|設備清單|設備|品項|項目|器材|需求設備|商品|租借內容|內容)/i],
    ["channel", /^(社群管道|預約管道|來源管道|管道|來源|平台)/i],
    ["note", /^(備註|其他需求|其他|特殊需求|說明|附註|留言)/i],
  ];

  function labelOf(line) {
    const t = line.replace(/^[\s\-•・*●◆▶>#\d.、)]+/, "");
    for (const [key, re] of LABELS) {
      const m = t.match(re);
      if (!m) continue;
      const rest = t.slice(m[0].length);
      const sep = rest.match(/^\s*[:=\]】]\s*|^\s+/);
      if (!sep && rest.length) continue;          // 「公司」後面直接接字，不視為標籤
      return { key, value: rest.slice(sep ? sep[0].length : 0).trim() };
    }
    return null;
  }

  // ---- 設備
  function lcs(a, b) {
    let best = 0;
    for (let i = 0; i < a.length; i++)
      for (let j = 0; j < b.length; j++) {
        let k = 0;
        while (a[i + k] && a[i + k] === b[j + k]) k++;
        if (k > best) best = k;
      }
    return best;
  }
  const squash = (s) => s.toLowerCase().replace(/[\s\-_()（）]/g, "");

  function matchEquipment(name, equipment) {
    const n = squash(name);
    if (n.length < 2 || !/[^\d.~\-:]/.test(n)) return null;   // 純數字（日期、電話碎片）不比對
    let best = null, score = 0;
    for (const e of equipment) {
      const en = squash(e.name);
      let sc = 0;
      if (en === n) sc = 1000;
      else if (en.includes(n) || n.includes(en)) sc = 500 + Math.min(en.length, n.length);
      else { const l = lcs(en, n); if (l >= 2) sc = l * 10 + l / Math.max(en.length, n.length); }
      if (sc > score) { score = sc; best = e; }
    }
    return best;
  }

  const UNIT = "台|臺|支|組|個|張|座|條|顆|套|片|盞|隻|只|把|組合|pcs|PCS|件";
  const QTY_RE = new RegExp(`(?:[x×X*]\\s*(\\d+|[一二兩两三四五六七八九十]+)\\s*(?:${UNIT})?)|(?:(\\d+|[一二兩两三四五六七八九十]+)\\s*(?:${UNIT}))|(?:數量\\s*:?\\s*(\\d+))`);

  function parseItemSegment(seg, equipment) {
    let s = seg.trim().replace(/^[\-•・*●◆▶>\d.、)]+\s*(?=\D)/, "").trim();
    if (!s) return null;
    let qty = 1;
    const m = s.match(QTY_RE);
    if (m) {
      const q = cnNum(m[1] || m[2] || m[3]);
      if (q > 0) qty = q;
      s = (s.slice(0, m.index) + " " + s.slice(m.index + m[0].length)).trim();
    } else {
      const tail = s.match(/\s(\d{1,3})$/);
      if (tail) { qty = parseInt(tail[1], 10); s = s.slice(0, tail.index).trim(); }
    }
    s = s.replace(/^(要|需要|租|借|想租|想借|共|各)\s*/, "").replace(/[:：]$/, "").trim();
    if (!s) return null;
    const eq = matchEquipment(s, equipment);
    return eq ? { equipment_id: eq.id, qty, source: seg.trim() } : { unmatched: seg.trim() };
  }

  function splitItems(s) {
    return s.split(/[、,，;；\n\/]|\s+(?:和|及|跟|與|加|\+)\s+|(?:和|及|跟|與)(?=[^\d\s])/).map((x) => x.trim()).filter(Boolean);
  }

  // ---- 主函式
  function parseBooking(raw, equipment, today) {
    const text = normalize(raw || "");
    const fields = {}, items = [], unmatched = [];
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const labeled = {};
    let lastKey = null;
    const free = [];
    for (const line of lines) {
      const lb = labelOf(line);
      if (lb) { lastKey = lb.key; labeled[lb.key] = labeled[lb.key] ? labeled[lb.key] + "\n" + lb.value : lb.value; }
      else if (lastKey === "items" || lastKey === "note") labeled[lastKey] += "\n" + line;   // 多行設備 / 備註
      else free.push(line);
    }

    // Email、電話：全文找
    const em = text.match(/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/);
    if (em) fields.email = em[0];
    const phoneSrc = labeled.phone || text;
    const ph = phoneSrc.match(/(?:\+?886[\s\-]?|0)9\d{2}[\s\-]?\d{3}[\s\-]?\d{3}|\(0\d{1,2}\)\s?\d{3,4}[\s\-]?\d{4}|0\d{1,2}[\s\-]\d{3,4}[\s\-]?\d{4}(?:\s*(?:#|分機|ext\.?)\s*\d+)?/);
    if (ph) fields.phone = ph[0].replace(/^\+?886[\s\-]?/, "0").trim();
    else if (labeled.phone) fields.phone = labeled.phone;

    // 社群管道：標籤優先，其次全文關鍵字
    const chSrc = labeled.channel || text;
    if (/蝦皮|shopee|虾皮/i.test(chSrc)) fields.channel = "蝦皮";
    else if (/\bLINE\b|line@|LINE官方/i.test(chSrc)) fields.channel = "LINE";
    else if (labeled.channel) fields.channel = "其他";

    if (labeled.company) fields.company = labeled.company;
    if (labeled.contact) fields.contact = labeled.contact.replace(/\s*(先生|小姐|女士)?\s*[\d\-()\s]{8,}$/, "").trim();
    if (labeled.note) fields.note = labeled.note.trim();

    // 沒有標籤時的公司名推測
    if (!fields.company) {
      const cm = text.match(/[一-龥A-Za-z0-9]{2,20}(?:股份有限公司|有限公司|公司|工作室|事務所|協會|基金會|學會|國小|國中|高中|大學|學校|教會|企業社|集團|診所|醫院)/);
      if (cm) fields.company = cm[0].replace(/^(我們是|我是|這裡是|您好我們是|你好我們是)/, "");
    }
    if (!fields.company) {
      const cm = text.match(/(?:我是|我們是|這裡是|這邊是)\s*([^\s，,。的]{2,20})的/);
      if (cm) fields.company = cm[1];
    }
    if (!fields.contact) {
      const TITLE = "先生|小姐|女士|老師|經理|主任|專員|協理|總監";
      const cm = text.match(new RegExp(`(?:我是|敝姓|我姓|的|找|^|\\s|，|,)\\s*([\\u4e00-\\u9fa5]{1,3}?)(${TITLE})`, "m"));
      if (cm) fields.contact = cm[1] + cm[2];
    }

    // 日期時間
    const pk = labeled.pickup ? dateTimeFrom(labeled.pickup, today) : { date: null, time: null };
    const rt = labeled.return ? dateTimeFrom(labeled.return, today) : { date: null, time: null };
    // 口語：「早上9點半去取」「晚上8點前還」
    if (!labeled.pickup || !labeled.return) {
      for (const clause of free.join("\n").split(/[\n，,。；;!！]/)) {
        const tm = findTime(clause.replace(DATE_RE, " "));
        if (!tm) continue;
        if (!labeled.pickup && !pk.time && /取|拿|領|送達|到貨/.test(clause)) { pk.time = tm; const d = findDates(clause, today); if (d.length) pk.date = d[0].date; }
        else if (!labeled.return && !rt.time && /還|歸|退|收回/.test(clause)) { rt.time = tm; const d = findDates(clause, today); if (d.length) rt.date = d[0].date; }
      }
    }
    let [start, end] = labeled.period ? findRange(labeled.period, today) : [null, null];
    if (!start && !pk.date && !rt.date) {
      // 沒有任何日期標籤：用全文第一個與最後一個日期
      const ds = findDates(text, today);
      if (ds.length) { start = ds[0].date; end = ds[ds.length - 1].date; }
      if (ds.length === 1) [start, end] = findRange(text.slice(ds[0].index), today);
    }
    start = start || pk.date || rt.date;
    end = end || rt.date || start;
    if (start && end && end < start) end = start;
    if (start) { fields.rental_start = start; fields.rental_end = end; }
    if (start || pk.date) fields.pickup_at = `${pk.date || start}T${pk.time || "10:00"}`;
    if (end || rt.date) fields.return_at = `${rt.date || end}T${rt.time || "18:00"}`;

    // 設備
    const itemSrc = labeled.items != null ? splitItems(labeled.items) : free.map((l) => l.replace(DATE_RE, " ")).flatMap(splitItems);
    for (const seg of itemSrc) {
      if (labeled.items == null && (/@|\d{4,}/.test(seg) || findDates(seg, today).length)) continue;
      const r = parseItemSegment(seg, equipment);
      if (!r) continue;
      if (r.unmatched) { if (labeled.items != null) unmatched.push(r.unmatched); continue; }
      const same = items.find((i) => i.equipment_id === r.equipment_id);
      if (same) same.qty += r.qty; else items.push(r);
    }
    return { fields, items, unmatched };
  }

  root.parseBooking = parseBooking;
  if (typeof module !== "undefined") module.exports = { parseBooking };
})(typeof window !== "undefined" ? window : globalThis);
