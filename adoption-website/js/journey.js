/* ===== 功能 4：領養人長期關懷模組（回訪系統） =====
 * 1 / 3 / 6 個月關懷提醒排程、線上近況問卷、
 * 「我的領養旅程」徽章牆與時間線。
 * 正式系統的 Email/推播排程由後端 cron 發送（見 README）。
 */

const CHECKPOINTS = [
  { months: 1, label: "滿 1 個月關懷" },
  { months: 3, label: "滿 3 個月關懷" },
  { months: 6, label: "滿 6 個月關懷" }
];

const BADGES = [
  { id: "adopt", icon: "🏠", label: "新手爸媽", desc: "完成領養", auto: () => true },
  { id: "cert", icon: "📜", label: "啟程", desc: "生成領養證書" },
  { id: "shop", icon: "🎁", label: "紀念收藏家", desc: "首次訂製紀念品" },
  { id: "survey", icon: "📋", label: "用心回報", desc: "完成一次近況問卷" },
  { id: "m1", icon: "🌙", label: "滿月陪伴", desc: "領養滿 1 個月", auto: () => monthsSince() >= 1 },
  { id: "m3", icon: "🌷", label: "季度夥伴", desc: "領養滿 3 個月", auto: () => monthsSince() >= 3 },
  { id: "m6", icon: "🌟", label: "半年家人", desc: "領養滿 6 個月", auto: () => monthsSince() >= 6 },
  { id: "y1", icon: "👑", label: "一生所愛", desc: "領養滿 1 年", auto: () => monthsSince() >= 12 }
];

function monthsSince() {
  const adopted = new Date(DB.myAdoption.adoptedAt);
  const now = new Date();
  return (now.getFullYear() - adopted.getFullYear()) * 12 + (now.getMonth() - adopted.getMonth());
}

function addMonths(dateStr, m) {
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + m);
  return d.toISOString().slice(0, 10);
}

function badgeUnlocked(b) {
  if (b.auto) return b.auto();
  return DB.myAdoption.extraBadges.includes(b.id);
}

/* 由其他模組呼叫：解鎖互動徽章 */
function unlockBadge(id) {
  if (DB.myAdoption.extraBadges.includes(id)) return;
  const badge = BADGES.find(b => b.id === id);
  if (!badge) return;
  DB.myAdoption.extraBadges.push(id);
  saveDB();
  renderJourney();
  showToast(`解鎖徽章：${badge.icon} ${badge.label}！`);
}

/* ===== 渲染 ===== */
function renderJourney() {
  const my = DB.myAdoption;

  // 關懷提醒排程
  document.getElementById("reminder-list").innerHTML = CHECKPOINTS.map(cp => {
    const due = addMonths(my.adoptedAt, cp.months);
    const passed = new Date(due) <= new Date();
    return `<div class="reminder">
      <span>💌 ${cp.label}（${due}）</span>
      <span class="tag ${passed ? "" : "pending"}">${passed ? "已寄送" : "排程中"}</span>
    </div>`;
  }).join("");

  // 徽章牆
  document.getElementById("badge-grid").innerHTML = BADGES.map(b => {
    const got = badgeUnlocked(b);
    return `<div class="badge ${got ? "" : "locked"}" title="${b.desc}">
      <span class="icon">${b.icon}</span>${b.label}
    </div>`;
  }).join("");

  // 時間線：領養日 + 已寄送的關懷 + 問卷紀錄
  const events = [
    { date: my.adoptedAt, text: `🎉 領養 ${my.emoji} ${my.petName}，旅程開始！` },
    ...CHECKPOINTS
      .filter(cp => new Date(addMonths(my.adoptedAt, cp.months)) <= new Date())
      .map(cp => ({ date: addMonths(my.adoptedAt, cp.months), text: `💌 已寄送「${cp.label}」提醒` })),
    ...my.surveys.map(s => ({
      date: s.date,
      text: `📋 回報近況：健康「${s.health}」、適應「${s.adapt}」${s.note ? ` — ${s.note}` : ""}`
    }))
  ].sort((a, b) => a.date.localeCompare(b.date));

  document.getElementById("timeline").innerHTML = events.map(e => `
    <div class="timeline-item">
      <div class="date">${e.date}</div>
      <div>${e.text}</div>
    </div>`).join("");
}

/* 近況問卷 */
document.getElementById("survey-form").addEventListener("submit", e => {
  e.preventDefault();
  DB.myAdoption.surveys.push({
    date: new Date().toISOString().slice(0, 10),
    health: document.getElementById("survey-health").value,
    adapt: document.getElementById("survey-adapt").value,
    note: document.getElementById("survey-note").value.trim()
  });
  saveDB();
  document.getElementById("survey-note").value = "";
  renderJourney();
  unlockBadge("survey");
  showToast("問卷已送出，謝謝你的回報 💛");
});

window.addEventListener("DOMContentLoaded", renderJourney);
