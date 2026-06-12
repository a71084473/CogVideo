/* ===== 全站：頁面切換、首頁渲染、Toast ===== */

function showToast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.remove("hidden");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => t.classList.add("hidden"), 2600);
}

function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById("page-" + page).classList.add("active");
  document.querySelectorAll(".nav-links a").forEach(a =>
    a.classList.toggle("active", a.dataset.nav === page));
  window.scrollTo({ top: 0, behavior: "smooth" });
  location.hash = page;
}

document.addEventListener("click", e => {
  const navEl = e.target.closest("[data-nav]");
  if (navEl) {
    e.preventDefault();
    navigate(navEl.dataset.nav);
  }
});

/* ===== 首頁：統計與等待領養卡片 ===== */
function renderHome() {
  const totalLikes = DB.stories.reduce((s, st) => s + st.likes, 0);
  document.getElementById("stat-adopted").textContent = DB.stories.length;
  document.getElementById("stat-waiting").textContent = DB.waiting.length;
  document.getElementById("stat-likes").textContent = totalLikes;

  document.getElementById("waiting-grid").innerHTML = DB.waiting.map(p => `
    <div class="pet-card">
      <div class="pet-avatar" style="background:${p.color}">${p.emoji}</div>
      <h4>${p.name}</h4>
      <div class="meta">${p.species} · ${p.region}<br>${p.desc}</div>
      <button class="btn btn-outline" data-nav="certificate"
        onclick="prefillCertificate('${p.id}')">我想領養 ❤</button>
    </div>
  `).join("");
}

/* 由首頁「我想領養」帶入證書頁的毛孩 */
function prefillCertificate(petId) {
  const sel = document.getElementById("cert-animal");
  sel.value = petId;
  sel.dispatchEvent(new Event("change"));
}

/* 依網址 hash 還原頁面 */
window.addEventListener("DOMContentLoaded", () => {
  renderHome();
  const page = location.hash.replace("#", "");
  if (page && document.getElementById("page-" + page)) navigate(page);
});
