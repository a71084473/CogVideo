// node tests/parser.test.js
const assert = require("assert");
const { parseBooking } = require("../static/booking_parser.js");
const EQ = [{ id: 1, name: "無線麥克風" }, { id: 2, name: "喇叭組" }, { id: 3, name: "混音器" }, { id: 4, name: "投影機" },
  { id: 5, name: "120吋布幕" }, { id: 6, name: "LED平板燈" }, { id: 7, name: "摺疊桌" }, { id: 8, name: "延長線" }];
const T = "2026-11-06";
let n = 0;
function check(name, text, exp, items) {
  const r = parseBooking(text, EQ, T);
  for (const [k, v] of Object.entries(exp)) assert.strictEqual(r.fields[k], v, `${name}: ${k} = ${r.fields[k]}`);
  if (items) assert.deepStrictEqual(r.items.map((i) => [i.equipment_id, i.qty]), items, `${name}: items ${JSON.stringify(r.items)}`);
  n++; return r;
}

check("labeled", `公司：好好活動有限公司
聯絡人：王小明
電話：0912-345-678
Email：ming@abc.com.tw
租借日期：11/20~11/22
取貨：11/20 早上9點半
歸還：11/22 下午6點
設備：無線麥克風x4、投影機 2台、喇叭組*2
備註：需要延長線`, { company: "好好活動有限公司", contact: "王小明", phone: "0912-345-678", email: "ming@abc.com.tw",
  rental_start: "2026-11-20", rental_end: "2026-11-22", pickup_at: "2026-11-20T09:30", return_at: "2026-11-22T18:00", note: "需要延長線" },
  [[1, 4], [4, 2], [2, 2]]);

check("line chat", `您好，我是星光婚禮的陳小姐，想租 12/5-7 用
麥克風兩支、LED燈 6盞、布幕一個
電話 0933222111 信箱 mei@star.com`, { phone: "0933222111", email: "mei@star.com", rental_start: "2026-12-05", rental_end: "2026-12-07",
  pickup_at: "2026-12-05T10:00", return_at: "2026-12-07T18:00", contact: "陳小姐" }, [[1, 2], [6, 6], [5, 1]]);

check("full date + roc", `單位：青田國小
聯絡人：林老師 (02)2345-6789
使用日期：116年1月3日
品項：
1. 摺疊桌 10張
2. 延長線 3條
3. 雷射筆 1支`, { company: "青田國小", contact: "林老師", phone: "(02)2345-6789", rental_start: "2027-01-03", rental_end: "2027-01-03" }, [[7, 10], [8, 3]]);

const r = parseBooking(`設備：雷射筆 1支、投影機`, EQ, T);
assert.deepStrictEqual(r.unmatched, ["雷射筆 1支"]); n++;

check("pickup/return only", `公司 晨光工作室
取件時間：2026/11/30 14:00
還件：12月1日 晚上8點
混音器 1台`, { company: "晨光工作室", rental_start: "2026-11-30", rental_end: "2026-12-01", pickup_at: "2026-11-30T14:00", return_at: "2026-12-01T20:00" }, [[3, 1]]);

check("past date => next year", `日期：1/10`, { rental_start: "2027-01-10" });
console.log(`parser ok (${n} cases)`);
check("casual times", `我是晨光國小的張老師，12/10-11 要用
混音器一台，早上9點半去取，最後一天晚上8點前還`, { company: "晨光國小", contact: "張老師", pickup_at: "2026-12-10T09:30", return_at: "2026-12-11T20:00" }, [[3, 1]]);
console.log("casual ok");
