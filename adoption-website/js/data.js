/* ===== 資料層：種子資料 + localStorage 持久化 =====
 * Demo 原型以 localStorage 模擬後端資料庫；
 * 正式系統請參考 README 的 API 與資料模型設計。
 */

const DB_KEY = "pawhome-db-v1";

const SEED = {
  // 等待領養的毛孩
  waiting: [
    { id: "w1", name: "豆豆", species: "狗", emoji: "🐕", color: "#ffe3c4", region: "台北", desc: "活潑親人的米克斯，最愛散步" },
    { id: "w2", name: "咪咪", species: "貓", emoji: "🐈", color: "#ffd9e8", region: "台中", desc: "氣質三花貓，安靜愛撒嬌" },
    { id: "w3", name: "黑糖", species: "狗", emoji: "🐕‍🦺", color: "#e2d6ff", region: "高雄", desc: "穩重大黑狗，超會看家" },
    { id: "w4", name: "雪球", species: "兔", emoji: "🐇", color: "#d6f0ff", region: "台北", desc: "白色垂耳兔，喜歡蘋果" },
    { id: "w5", name: "橘子", species: "貓", emoji: "🐈‍⬛", color: "#ffe9b3", region: "花蓮", desc: "貪吃橘貓，呼嚕聲超大" },
    { id: "w6", name: "妞妞", species: "狗", emoji: "🦮", color: "#d8f5e3", region: "台中", desc: "溫柔黃金獵犬混血，適合家庭" }
  ],

  // 功能 3：已成功領養的故事
  stories: [
    { id: "s1", petName: "麻吉", species: "狗", emoji: "🐶", color: "#ffe3c4", region: "台北",
      owner: "陳小姐", quote: "牠讓我每天下班都有了期待！", date: "2026-06-02",
      likes: 42, comments: [{ name: "路人甲", text: "恭喜麻吉找到家！" }] },
    { id: "s2", petName: "布丁", species: "貓", emoji: "😺", color: "#ffe9b3", region: "台中",
      owner: "林先生", quote: "原來被貓選中是這種感覺。", date: "2026-05-28",
      likes: 67, comments: [{ name: "貓奴一號", text: "布丁太可愛了吧！" }] },
    { id: "s3", petName: "皮蛋", species: "狗", emoji: "🐕", color: "#e2d6ff", region: "高雄",
      owner: "張同學", quote: "從怕生到黏人，只花了三天。", date: "2026-05-15",
      likes: 38, comments: [] },
    { id: "s4", petName: "棉花", species: "兔", emoji: "🐰", color: "#d6f0ff", region: "台北",
      owner: "黃小姐", quote: "家裡多了一團會動的棉花糖。", date: "2026-04-30",
      likes: 55, comments: [{ name: "兔友", text: "垂耳兔最可愛！" }] },
    { id: "s5", petName: "歐告", species: "狗", emoji: "🦮", color: "#d8f5e3", region: "花蓮",
      owner: "吳先生", quote: "牠現在是花蓮最快樂的狗。", date: "2026-04-12",
      likes: 73, comments: [] },
    { id: "s6", petName: "芝麻", species: "貓", emoji: "🐈‍⬛", color: "#e0e0e0", region: "台中",
      owner: "周小姐", quote: "黑貓帶來的不是厄運，是好眠。", date: "2026-03-22",
      likes: 91, comments: [{ name: "夜貓子", text: "黑貓控報到 🙋" }] }
  ],

  // 功能 4：使用者的領養紀錄（Demo 預設一筆）
  myAdoption: {
    petName: "麻吉", emoji: "🐶", color: "#ffe3c4",
    adoptedAt: "2026-01-10",
    surveys: [],          // {date, health, adapt, note}
    extraBadges: []       // 由互動解鎖的徽章 id
  },

  orders: [],             // 功能 2：訂單 {id, product, petName, message, qty, total, createdAt, name, address, payment}
  likedStories: []        // 訪客按過讚的故事 id
};

function loadDB() {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* 損毀則重建 */ }
  const fresh = JSON.parse(JSON.stringify(SEED));
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDB() {
  localStorage.setItem(DB_KEY, JSON.stringify(DB));
}

const DB = loadDB();

/* 在 canvas 上畫毛孩頭像（emoji 或上傳的照片） */
function drawPetAvatar(ctx, x, y, r, pet, photo) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.closePath();
  if (photo) {
    ctx.clip();
    const scale = Math.max((r * 2) / photo.width, (r * 2) / photo.height);
    const w = photo.width * scale, h = photo.height * scale;
    ctx.drawImage(photo, x - w / 2, y - h / 2, w, h);
  } else {
    ctx.fillStyle = pet ? pet.color : "#ffe3c4";
    ctx.fill();
    ctx.font = `${r * 1.1}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(pet ? pet.emoji : "🐾", x, y + r * 0.08);
  }
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "#f4845f";
  ctx.stroke();
}
