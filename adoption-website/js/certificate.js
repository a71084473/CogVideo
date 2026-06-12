/* ===== 功能 1：即時領養證書系統 =====
 * 領養成功後即時在 Canvas 生成電子證書（動物照片、名字、領養人、日期），
 * 可下載 PNG，並一鍵分享到 Facebook / Instagram / LINE。
 */

const certCanvas = document.getElementById("cert-canvas");
const certCtx = certCanvas.getContext("2d");
let certPhoto = null; // 使用者上傳的照片（Image 物件）

/* 初始化毛孩下拉選單（證書頁與商店頁共用資料） */
function fillAnimalSelect(selectId) {
  const sel = document.getElementById(selectId);
  sel.innerHTML = DB.waiting.map(p =>
    `<option value="${p.id}">${p.emoji} ${p.name}（${p.species} · ${p.region}）</option>`).join("");
}

function getSelectedPet(selectId) {
  return DB.waiting.find(p => p.id === document.getElementById(selectId).value) || DB.waiting[0];
}

function drawCertificate() {
  const pet = getSelectedPet("cert-animal");
  const petName = document.getElementById("cert-pet-name").value.trim() || pet.name;
  const ownerName = document.getElementById("cert-owner-name").value.trim() || "＿＿＿＿";
  const dateVal = document.getElementById("cert-date").value || new Date().toISOString().slice(0, 10);

  const W = certCanvas.width, H = certCanvas.height;
  const ctx = certCtx;

  // 底色與外框
  ctx.fillStyle = "#fffaf3";
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = "#f4845f";
  ctx.lineWidth = 10;
  ctx.strokeRect(18, 18, W - 36, H - 36);
  ctx.strokeStyle = "#f7c59f";
  ctx.lineWidth = 3;
  ctx.strokeRect(34, 34, W - 68, H - 68);

  // 四角腳印裝飾
  ctx.font = "30px serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]].forEach(([x, y]) =>
    ctx.fillText("🐾", x, y));

  // 標題
  ctx.fillStyle = "#e2693f";
  ctx.font = "bold 46px 'Noto Sans TC', sans-serif";
  ctx.fillText("領 養 證 書", W / 2, 110);
  ctx.fillStyle = "#b9a89a";
  ctx.font = "20px 'Noto Sans TC', sans-serif";
  ctx.fillText("Certificate of Adoption", W / 2, 148);

  // 毛孩頭像
  drawPetAvatar(ctx, W / 2, 270, 90, pet, certPhoto);

  // 內文
  ctx.fillStyle = "#3d3229";
  ctx.font = "26px 'Noto Sans TC', sans-serif";
  ctx.fillText(`茲證明　${ownerName}　正式領養`, W / 2, 420);

  ctx.fillStyle = "#e2693f";
  ctx.font = "bold 40px 'Noto Sans TC', sans-serif";
  ctx.fillText(`「${petName}」`, W / 2, 472);

  ctx.fillStyle = "#3d3229";
  ctx.font = "22px 'Noto Sans TC', sans-serif";
  ctx.fillText("從此刻起，你們是彼此最重要的家人 ❤", W / 2, 520);

  ctx.fillStyle = "#8a7d70";
  ctx.font = "20px 'Noto Sans TC', sans-serif";
  ctx.fillText(`領養日期：${dateVal}　·　毛孩之家 認證`, W / 2, 580);
}

document.getElementById("cert-generate").addEventListener("click", () => {
  drawCertificate();
  const actions = document.getElementById("cert-actions");
  actions.classList.remove("hidden");
  document.getElementById("cert-download").href = certCanvas.toDataURL("image/png");
  showToast("證書生成完成 🎉");

  // 功能 4 連動：生成證書解鎖「啟程」徽章
  unlockBadge("cert");
});

document.getElementById("cert-photo").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => { certPhoto = img; drawCertificate(); };
  img.src = URL.createObjectURL(file);
});

["cert-animal", "cert-pet-name", "cert-owner-name", "cert-date"].forEach(id =>
  document.getElementById(id).addEventListener("change", drawCertificate));
document.getElementById("cert-animal").addEventListener("change", () => { certPhoto = null; });

/* ===== 一鍵社群分享 ===== */
function shareText() {
  const pet = getSelectedPet("cert-animal");
  const petName = document.getElementById("cert-pet-name").value.trim() || pet.name;
  return `我在「毛孩之家」領養了 ${petName}！領養代替購買，給浪浪一個家 🐾`;
}

document.querySelectorAll("[data-share]").forEach(btn => {
  btn.addEventListener("click", async () => {
    const url = encodeURIComponent(location.origin + location.pathname + "#stories");
    const text = shareText();
    const type = btn.dataset.share;

    if (type === "facebook") {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${encodeURIComponent(text)}`,
        "_blank", "width=600,height=480");
    } else if (type === "line") {
      window.open(`https://social-plugins.line.me/lineit/share?url=${url}&text=${encodeURIComponent(text)}`,
        "_blank", "width=600,height=480");
    } else if (type === "instagram") {
      // IG 無網頁分享 API：下載圖片＋複製文案，方便使用者貼文
      const a = document.createElement("a");
      a.href = certCanvas.toDataURL("image/png");
      a.download = "adoption-certificate.png";
      a.click();
      try { await navigator.clipboard.writeText(text); } catch (e) { /* 無剪貼簿權限時略過 */ }
      showToast("已下載證書並複製文案，到 IG 貼文吧！");
      return;
    }
    showToast("分享視窗已開啟 📣");
  });
});

window.addEventListener("DOMContentLoaded", () => {
  fillAnimalSelect("cert-animal");
  document.getElementById("cert-date").value = new Date().toISOString().slice(0, 10);
  drawCertificate();
});
