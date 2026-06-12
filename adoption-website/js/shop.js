/* ===== 功能 2：個性化紀念品訂製 =====
 * 馬克杯／吊牌／T恤客製商品，Canvas 即時預覽（毛孩圖＋名字＋祝福語），
 * 含模擬結帳流程與物流追蹤時間軸。
 */

const shopCanvas = document.getElementById("shop-canvas");
const shopCtx = shopCanvas.getContext("2d");
let shopPhoto = null;

const PRODUCT_INFO = {
  mug: { label: "馬克杯", price: 350 },
  tag: { label: "寵物吊牌", price: 180 },
  tshirt: { label: "T 恤", price: 490 }
};

const TRACK_STEPS = ["已下單", "製作中", "已出貨", "配送中", "已送達"];

function shopState() {
  const product = document.getElementById("shop-product").value;
  const pet = getSelectedPet("shop-animal");
  return {
    product,
    pet,
    petName: document.getElementById("shop-pet-name").value.trim() || pet.name,
    message: document.getElementById("shop-message").value.trim(),
    qty: Math.max(1, parseInt(document.getElementById("shop-qty").value, 10) || 1),
    price: PRODUCT_INFO[product].price
  };
}

/* ===== 即時預覽 ===== */
function drawShopPreview() {
  const s = shopState();
  const ctx = shopCtx;
  const W = shopCanvas.width, H = shopCanvas.height;

  ctx.fillStyle = "#fdf4ea";
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  if (s.product === "mug") drawMug(ctx, W, H, s);
  else if (s.product === "tag") drawTag(ctx, W, H, s);
  else drawTshirt(ctx, W, H, s);

  // 預覽水印
  ctx.fillStyle = "rgba(138,125,112,.5)";
  ctx.font = "16px 'Noto Sans TC', sans-serif";
  ctx.fillText("— 即時預覽 PREVIEW —", W / 2, H - 24);
}

function drawMug(ctx, W, H, s) {
  const cx = W / 2 - 20, cy = H / 2;
  // 杯身
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#d9cbbd";
  ctx.lineWidth = 4;
  roundRect(ctx, cx - 150, cy - 150, 300, 300, 24);
  ctx.fill(); ctx.stroke();
  // 杯把
  ctx.beginPath();
  ctx.arc(cx + 170, cy, 60, -Math.PI / 2, Math.PI / 2);
  ctx.lineWidth = 22;
  ctx.strokeStyle = "#fff";
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.strokeStyle = "#d9cbbd";
  ctx.beginPath();
  ctx.arc(cx + 170, cy, 72, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx + 170, cy, 48, -Math.PI / 2, Math.PI / 2);
  ctx.stroke();

  drawPetAvatar(ctx, cx, cy - 45, 62, s.pet, shopPhoto);
  ctx.fillStyle = "#e2693f";
  ctx.font = "bold 30px 'Noto Sans TC', sans-serif";
  ctx.fillText(s.petName, cx, cy + 55);
  if (s.message) {
    ctx.fillStyle = "#8a7d70";
    ctx.font = "18px 'Noto Sans TC', sans-serif";
    ctx.fillText(s.message, cx, cy + 95);
  }
}

function drawTag(ctx, W, H, s) {
  const cx = W / 2, cy = H / 2 + 14;
  // 吊環
  ctx.beginPath();
  ctx.arc(cx, cy - 158, 22, 0, Math.PI * 2);
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#c9b8a6";
  ctx.stroke();
  // 骨頭形吊牌主體
  ctx.fillStyle = "#ffd98e";
  ctx.strokeStyle = "#e2b75f";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(cx, cy, 130, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  drawPetAvatar(ctx, cx, cy - 36, 52, s.pet, shopPhoto);
  ctx.fillStyle = "#7a5c1e";
  ctx.font = "bold 28px 'Noto Sans TC', sans-serif";
  ctx.fillText(s.petName, cx, cy + 48);
  if (s.message) {
    ctx.font = "15px 'Noto Sans TC', sans-serif";
    ctx.fillText(s.message, cx, cy + 82);
  }
}

function drawTshirt(ctx, W, H, s) {
  const cx = W / 2, cy = H / 2 + 10;
  ctx.fillStyle = "#fff";
  ctx.strokeStyle = "#d9cbbd";
  ctx.lineWidth = 4;
  // 簡化 T 恤輪廓
  ctx.beginPath();
  ctx.moveTo(cx - 110, cy - 170);
  ctx.lineTo(cx - 200, cy - 110);  // 左袖
  ctx.lineTo(cx - 160, cy - 50);
  ctx.lineTo(cx - 120, cy - 80);
  ctx.lineTo(cx - 120, cy + 180);  // 左側
  ctx.lineTo(cx + 120, cy + 180);  // 下襬
  ctx.lineTo(cx + 120, cy - 80);
  ctx.lineTo(cx + 160, cy - 50);
  ctx.lineTo(cx + 200, cy - 110);  // 右袖
  ctx.lineTo(cx + 110, cy - 170);
  ctx.quadraticCurveTo(cx, cy - 120, cx - 110, cy - 170); // 領口
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  drawPetAvatar(ctx, cx, cy - 10, 58, s.pet, shopPhoto);
  ctx.fillStyle = "#e2693f";
  ctx.font = "bold 26px 'Noto Sans TC', sans-serif";
  ctx.fillText(s.petName, cx, cy + 82);
  if (s.message) {
    ctx.fillStyle = "#8a7d70";
    ctx.font = "16px 'Noto Sans TC', sans-serif";
    ctx.fillText(s.message, cx, cy + 118);
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function updatePrice() {
  const s = shopState();
  document.getElementById("shop-price").textContent = `NT$${s.price * s.qty}`;
}

/* ===== 結帳流程 ===== */
const modal = document.getElementById("checkout-modal");

document.getElementById("shop-checkout").addEventListener("click", () => {
  const s = shopState();
  document.getElementById("checkout-summary").innerHTML = `
    <b>${PRODUCT_INFO[s.product].label}</b> × ${s.qty}<br>
    毛孩：${s.petName}${s.message ? `　祝福語：「${s.message}」` : ""}<br>
    總金額：<b>NT$${s.price * s.qty}</b>（含運費 NT$0，領養人免運）`;
  modal.classList.remove("hidden");
});

document.getElementById("ck-cancel").addEventListener("click", () => modal.classList.add("hidden"));

document.getElementById("ck-confirm").addEventListener("click", () => {
  const name = document.getElementById("ck-name").value.trim();
  const address = document.getElementById("ck-address").value.trim();
  if (!name || !address) { showToast("請填寫收件人與地址"); return; }

  const s = shopState();
  DB.orders.unshift({
    id: "PH" + Date.now().toString().slice(-8),
    product: PRODUCT_INFO[s.product].label,
    petName: s.petName,
    message: s.message,
    qty: s.qty,
    total: s.price * s.qty,
    createdAt: new Date().toISOString().slice(0, 10),
    name, address,
    payment: document.getElementById("ck-payment").value,
    step: 0 // 物流階段索引，正式系統由物流商 webhook 更新
  });
  saveDB();
  modal.classList.add("hidden");
  renderOrders();
  showToast("付款成功！訂單已成立 🎉");
  unlockBadge("shop"); // 功能 4 連動：首次訂製解鎖徽章

  // Demo：模擬物流狀態每 8 秒推進一階段
  simulateLogistics(DB.orders[0].id);
});

/* ===== 訂單列表與物流追蹤 ===== */
function renderOrders() {
  const wrap = document.getElementById("order-list");
  if (!DB.orders.length) {
    wrap.innerHTML = `<p class="empty-hint">尚無訂單，快訂製一份專屬紀念品吧！</p>`;
    return;
  }
  wrap.innerHTML = DB.orders.map(o => `
    <div class="order-card">
      <div class="order-top">
        <span class="order-id">訂單 ${o.id}</span>
        <span class="order-status">${TRACK_STEPS[o.step]}</span>
      </div>
      <div>${o.product} × ${o.qty}（${o.petName}${o.message ? `・「${o.message}」` : ""}）
        — NT$${o.total} · ${o.payment} · ${o.createdAt}</div>
      <div class="track-steps">
        ${TRACK_STEPS.map((st, i) =>
          `<div class="track-step ${i <= o.step ? "done" : ""}">${st}</div>`).join("")}
      </div>
    </div>
  `).join("");
}

function simulateLogistics(orderId) {
  const timer = setInterval(() => {
    const order = DB.orders.find(o => o.id === orderId);
    if (!order || order.step >= TRACK_STEPS.length - 1) { clearInterval(timer); return; }
    order.step++;
    saveDB();
    renderOrders();
  }, 8000);
}

/* ===== 事件綁定 ===== */
document.getElementById("shop-photo").addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  const img = new Image();
  img.onload = () => { shopPhoto = img; drawShopPreview(); };
  img.src = URL.createObjectURL(file);
});

["shop-product", "shop-animal", "shop-pet-name", "shop-message", "shop-qty"].forEach(id => {
  const el = document.getElementById(id);
  el.addEventListener("change", () => { drawShopPreview(); updatePrice(); });
  el.addEventListener("input", () => { drawShopPreview(); updatePrice(); });
});
document.getElementById("shop-animal").addEventListener("change", () => { shopPhoto = null; });

window.addEventListener("DOMContentLoaded", () => {
  fillAnimalSelect("shop-animal");
  drawShopPreview();
  updatePrice();
  renderOrders();
});
