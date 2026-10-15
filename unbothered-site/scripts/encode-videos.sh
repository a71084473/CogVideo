#!/bin/sh
# Re-encode source footage for the site.
#   Desktop (scroll-scrubbed): every frame is a keyframe (-g 1) so seeking is instant.
#   Mobile (autoplay):         normal GOP, much smaller.
# Usage: sh scripts/encode-videos.sh path/to/source.mp4
# The source is split at the 12s scene cut: 0–12s -> duck-float, 12–24s -> duck-dive.
set -e
SRC="$1"
OUT="$(dirname "$0")/../public"
[ -f "$SRC" ] || { echo "usage: $0 source.mp4"; exit 1; }

enc() { # start duration extra-args output
  ffmpeg -v error -y -ss "$1" -i "$SRC" -t "$2" -an -vf "scale=720:-2,fps=30" \
    -c:v libx264 -pix_fmt yuv420p -preset slow $3 -movflags +faststart "$OUT/$4"
}

enc 0     11.9 "-g 1 -crf 30" duck-float.mp4
enc 12.05 11.9 "-g 1 -crf 30" duck-dive.mp4
enc 0     11.9 "-crf 28"      duck-float-mobile.mp4
enc 12.05 11.9 "-crf 28"      duck-dive-mobile.mp4

ffmpeg -v error -y -ss 1 -i "$OUT/duck-float.mp4" -frames:v 1 -q:v 4 "$OUT/duck-float-poster.jpg"
ffmpeg -v error -y -ss 1 -i "$OUT/duck-dive.mp4"  -frames:v 1 -q:v 4 "$OUT/duck-dive-poster.jpg"
echo "done -> $OUT"
