#!/usr/bin/env bash
# 將任意影片轉成「網站首頁 Hero 背景影片」：高級設備質感調色 + 多格式多解析度輸出
# 用法: ./make_hero.sh <輸入影片> [輸出資料夾=out] [開始秒數=0] [長度秒數=12]
set -euo pipefail
export SVT_LOG=1  # 只顯示錯誤
IN="${1:?請提供輸入影片路徑}"
OUT="${2:-out}"; SS="${3:-0}"; DUR="${4:-12}"
mkdir -p "$OUT"

# ── 質感調色（Premium / 精品科技風）─────────────────────────
# 1. 輕微壓暗中間調、提高對比 → 深邃、沉穩
# 2. 降低飽和度 → 去除手機原生的艷麗感，偏金屬冷調
# 3. 暗部偏冷藍、亮部偏暖 → 電影級 teal & orange（克制版）
# 4. 柔和 S 曲線 + 暗角 → 視覺聚焦於主體
# 5. 細微動態顆粒 → 避免壓縮色帶（banding），增加膠片質地
# 6. 高品質降噪 + 銳化 → 設備細節更清晰
GRADE="hqdn3d=1.5:1.5:6:6,\
eq=contrast=1.08:brightness=-0.03:saturation=0.82:gamma=0.97,\
colorbalance=rs=-0.04:gs=-0.01:bs=0.05:rh=0.03:gh=0.01:bh=-0.03,\
curves=all='0/0.02 0.25/0.21 0.5/0.5 0.75/0.79 1/0.98',\
vignette=angle=PI/5:mode=forward,\
unsharp=5:5:0.45:5:5:0,\
noise=alls=3:allf=t"

# 片頭片尾淡入淡出，搭配 loop 播放時銜接平順
FADE="fade=t=in:st=0:d=0.8,fade=t=out:st=$(awk "BEGIN{print $DUR-0.8}"):d=0.8"

encode () { # $1=高度 $2=後綴
  local H="$1" S="$2"
  local VF="scale=-2:${H}:flags=lanczos,fps=30,${GRADE},${FADE},format=yuv420p"
  # H.264 MP4（全瀏覽器相容，faststart 可邊下載邊播）
  ffmpeg -y -hide_banner -loglevel error -ss "$SS" -t "$DUR" -i "$IN" -an -vf "$VF" \
    -c:v libx264 -preset slow -crf 23 -profile:v high -tune film \
    -g 60 -movflags +faststart "$OUT/hero-${S}.mp4"
  # AV1 WebM（同畫質檔案小 30–50%，現代瀏覽器優先載入）
  ffmpeg -y -hide_banner -loglevel error -ss "$SS" -t "$DUR" -i "$IN" -an -vf "$VF" \
    -c:v libsvtav1 -preset 6 -crf 36 -g 60 -svtav1-params tune=0 "$OUT/hero-${S}.webm"
}

echo "▶ 輸出 1080p（桌機）"; encode 1080 1080
echo "▶ 輸出 720p（手機）";  encode 720 720

# 首幀海報圖（影片載入前顯示，避免黑畫面；也作為省電/減少動態模式的靜態圖）
ffmpeg -y -hide_banner -loglevel error -ss "$(awk "BEGIN{print $SS+1}")" -i "$IN" -frames:v 1 \
  -vf "scale=-2:1080:flags=lanczos,${GRADE%,noise*}" -c:v libwebp -quality 82 "$OUT/hero-poster.webp"
ffmpeg -y -hide_banner -loglevel error -i "$OUT/hero-poster.webp" -q:v 3 "$OUT/hero-poster.jpg"

echo "✔ 完成："; ls -lh "$OUT" | awk 'NR>1{print "  "$5"\t"$9}'
