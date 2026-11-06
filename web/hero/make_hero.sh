#!/usr/bin/env bash
# 將任意影片轉成「網站首頁 Hero 背景影片」：防手震 + 慢動作 + 高級設備質感調色 + 無縫循環
#
# 用法: ./make_hero.sh <輸入影片> [輸出資料夾=media] [開始秒數=0] [長度秒數=原片長度]
#
# 可用環境變數調整：
#   STAB=1        防手震（vidstab 兩階段），0 關閉            預設 1
#   SPEED=0.6     播放速度，<1 為慢動作（以光流補幀到 30fps）   預設 0.6
#   LOOP=boomerang  循環方式：boomerang（正放+倒放，無縫）或 fade（頭尾淡入淡出）
#   STYLE=bright  色調：bright（明亮產品攝影）或 dark（暗調精品）   預設 bright
#   CRF_MP4=23 CRF_AV1=36  畫質/檔案大小（數字越大檔案越小）
set -euo pipefail
export SVT_LOG=1  # SVT-AV1 只顯示錯誤

IN="${1:?請提供輸入影片路徑}"
OUT="${2:-media}"; SS="${3:-0}"; DUR="${4:-}"
STAB="${STAB:-1}"; SPEED="${SPEED:-0.6}"; LOOP="${LOOP:-boomerang}"
STYLE="${STYLE:-bright}"; CRF_MP4="${CRF_MP4:-23}"; CRF_AV1="${CRF_AV1:-36}"
mkdir -p "$OUT"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
FF=(ffmpeg -y -hide_banner -loglevel error)
TRIM=(-ss "$SS"); [ -n "$DUR" ] && TRIM+=(-t "$DUR")

# ── 1. 母帶：裁切片段 → 防手震 → 慢動作補幀 → 循環 ──────────────
echo "▶ 製作母帶（防手震 / 慢動作 / 循環）"
"${FF[@]}" "${TRIM[@]}" -i "$IN" -an -c:v libx264 -crf 10 -preset fast "$TMP/cut.mp4"

PRE="null"
if [ "$STAB" = 1 ]; then
  "${FF[@]}" -i "$TMP/cut.mp4" -vf "vidstabdetect=shakiness=6:accuracy=15:result=$TMP/t.trf" -f null -
  # smoothing 越大鏡頭越像滑軌般平穩；optzoom 自動放大裁掉晃動黑邊
  PRE="vidstabtransform=input=$TMP/t.trf:smoothing=45:optzoom=1:zoom=2:interpol=bicubic"
fi
SLOW="null"
if awk "BEGIN{exit !($SPEED != 1)}"; then
  SLOW="setpts=PTS/${SPEED},minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"
fi
"${FF[@]}" -i "$TMP/cut.mp4" -vf "${PRE},${SLOW},fps=30" -c:v libx264 -crf 10 -preset fast "$TMP/slow.mp4"

if [ "$LOOP" = boomerang ]; then
  # 正放 + 倒放（去掉重複的頭尾幀），首尾相接完全無縫
  N=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$TMP/slow.mp4")
  "${FF[@]}" -i "$TMP/slow.mp4" -filter_complex \
    "[0]split[a][b];[b]reverse,trim=start_frame=1:end_frame=$((N-1)),setpts=PTS-STARTPTS[r];[a][r]concat=n=2:v=1" \
    -c:v libx264 -crf 10 -preset fast "$TMP/master.mp4"
  FADE="null"
else
  cp "$TMP/slow.mp4" "$TMP/master.mp4"
  L=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/master.mp4")
  FADE="fade=t=in:st=0:d=0.8,fade=t=out:st=$(awk "BEGIN{print $L-0.8}"):d=0.8"
fi

# ── 2. 調色 ────────────────────────────────────────────────
if [ "$STYLE" = bright ]; then
  # 明亮產品攝影風：
  # · 全區間去橘偏藍 → 修正室內燈泡黃光，白色機身回到乾淨的白
  # · gamma 提亮 + 曲線拉高中間調，黑位維持 → 明亮但不灰霧
  # · 輕微降飽和、加強銳化 → 乾淨俐落、細節清楚，無暗角、無顆粒
  GRADE="hqdn3d=1.5:1.5:6:6,\
colorbalance=rs=-0.08:gs=-0.02:bs=0.09:rm=-0.10:gm=-0.01:bm=0.09:rh=-0.05:bh=0.05,\
eq=contrast=1.04:saturation=0.9:gamma=1.3,\
curves=all='0/0.02 0.25/0.36 0.6/0.76 0.9/0.97 1/1',\
unsharp=5:5:0.6:5:5:0"
  GRAIN="null"
else
  # 暗調精品風：壓暗背景、去橘偏冷、S 曲線、暗角、細顆粒
  GRADE="hqdn3d=1.5:1.5:6:6,\
unsharp=5:5:0.4:5:5:0,\
eq=contrast=1.12:brightness=-0.03:saturation=0.78:gamma=0.95,\
colorbalance=rs=-0.06:gs=-0.02:bs=0.04:rm=-0.04:bm=0.03:rh=-0.02:bh=0.02,\
curves=all='0/0.015 0.2/0.14 0.5/0.48 0.8/0.86 1/1',\
vignette=angle=PI/4.5"
  GRAIN="noise=alls=3:allf=t"
fi

encode () { # $1=高度
  local H="$1"
  local VF="scale=-2:${H}:flags=lanczos,${GRADE},${GRAIN},${FADE},format=yuv420p"
  echo "▶ 輸出 ${H}p"
  # H.264 MP4：全瀏覽器相容，faststart 讓影片邊下載邊播
  "${FF[@]}" -i "$TMP/master.mp4" -vf "$VF" -c:v libx264 -preset slow -crf "$CRF_MP4" \
    -profile:v high -tune film -g 60 -movflags +faststart "$OUT/hero-${H}.mp4"
  # AV1 WebM：同畫質檔案小 30–50%，現代瀏覽器優先使用
  "${FF[@]}" -i "$TMP/master.mp4" -vf "$VF" -c:v libsvtav1 -preset 6 -crf "$CRF_AV1" \
    -g 60 -svtav1-params tune=0 "$OUT/hero-${H}.webm"
}
encode 1080
encode 720

# ── 3. 海報圖：影片載入前 / 減少動態模式時顯示 ────────────────────
"${FF[@]}" -i "$TMP/master.mp4" -frames:v 1 -vf "scale=-2:1080:flags=lanczos,${GRADE}" \
  -c:v libwebp -quality 82 "$OUT/hero-poster.webp"
"${FF[@]}" -i "$OUT/hero-poster.webp" -q:v 3 "$OUT/hero-poster.jpg"

echo "✔ 完成："; ls -lh "$OUT" | awk 'NR>1{print "  "$5"\t"$9}'
