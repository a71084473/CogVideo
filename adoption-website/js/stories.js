/* ===== 功能 3：領養故事牆 =====
 * 顯示成功領養動態（合照、一句話感言、日期），
 * 支援按讚、留言祝賀，以及種類／地區／日期排序篩選。
 */

function renderStories() {
  const species = document.getElementById("filter-species").value;
  const region = document.getElementById("filter-region").value;
  const sort = document.getElementById("filter-sort").value;

  let list = DB.stories.filter(s =>
    (!species || s.species === species) && (!region || s.region === region));

  list.sort((a, b) => {
    if (sort === "likes") return b.likes - a.likes;
    if (sort === "oldest") return a.date.localeCompare(b.date);
    return b.date.localeCompare(a.date);
  });

  const wall = document.getElementById("story-wall");
  if (!list.length) {
    wall.innerHTML = `<p class="empty-hint">沒有符合條件的故事，換個篩選看看吧！</p>`;
    return;
  }

  wall.innerHTML = list.map(s => {
    const liked = DB.likedStories.includes(s.id);
    return `
    <div class="story-card" data-id="${s.id}">
      <div class="story-head">
        <div class="pet-avatar" style="background:${s.color}">${s.emoji}</div>
        <div>
          <h4>${s.petName} ✕ ${s.owner}</h4>
          <div class="meta">${s.species} · ${s.region} · ${s.date} 領養</div>
        </div>
      </div>
      <div class="story-quote">「${s.quote}」</div>
      <div class="story-actions">
        <button class="like-btn ${liked ? "liked" : ""}" data-like="${s.id}">
          ${liked ? "❤" : "🤍"} ${s.likes}
        </button>
      </div>
      <div class="comments">
        ${s.comments.map(c => `<div class="comment"><b>${escapeHTML(c.name)}</b>：${escapeHTML(c.text)}</div>`).join("")}
        <form class="comment-form" data-comment="${s.id}">
          <input type="text" placeholder="留下你的祝福…" maxlength="60" required>
          <button type="submit">送出</button>
        </form>
      </div>
    </div>`;
  }).join("");
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* 按讚（每位訪客每則一次，可收回） */
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-like]");
  if (!btn) return;
  const id = btn.dataset.like;
  const story = DB.stories.find(s => s.id === id);
  const idx = DB.likedStories.indexOf(id);
  if (idx >= 0) {
    DB.likedStories.splice(idx, 1);
    story.likes--;
  } else {
    DB.likedStories.push(id);
    story.likes++;
    showToast("謝謝你的祝福 ❤");
  }
  saveDB();
  renderStories();
  renderHome();
});

/* 留言祝賀 */
document.addEventListener("submit", e => {
  const form = e.target.closest("[data-comment]");
  if (!form) return;
  e.preventDefault();
  const input = form.querySelector("input");
  const text = input.value.trim();
  if (!text) return;
  const story = DB.stories.find(s => s.id === form.dataset.comment);
  story.comments.push({ name: "熱心訪客", text });
  saveDB();
  renderStories();
  showToast("留言成功，謝謝你的祝賀！");
});

["filter-species", "filter-region", "filter-sort"].forEach(id =>
  document.getElementById(id).addEventListener("change", renderStories));

window.addEventListener("DOMContentLoaded", renderStories);
