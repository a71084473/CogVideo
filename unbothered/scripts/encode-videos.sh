#!/usr/bin/env bash
# Splits the source footage into the two scroll-scrubbed clips and
# re-encodes them all-keyframe (-g 1) so seeking to any currentTime is instant.
#   usage: bash scripts/encode-videos.sh path/to/source.mp4
set -euo pipefail
SRC="${1:?usage: encode-videos.sh <source.mp4>}"
OUT="$(dirname "$0")/../public"
FLOAT_END=12.15  # cross-fade from skyline to palace hall runs 12.2s-12.45s; drop it
DIVE_START=12.45

enc() { # <out> <ffmpeg input args...>
  local out="$1"; shift
  ffmpeg -y -v error "$@" -an -c:v libx264 -preset slow -crf 31 \
    -g 1 -keyint_min 1 -sc_threshold 0 -pix_fmt yuv420p -movflags +faststart "$OUT/$out"
}

# WebM/VP9 fallback: browsers without H.264 (Chromium builds, some Linux Firefox)
encw() { # <out> <ffmpeg input args...>
  local out="$1"; shift
  ffmpeg -y -v error "$@" -an -c:v libvpx-vp9 -b:v 0 -crf 54 -row-mt 1 -deadline good -cpu-used 4 \
    -g 1 -keyint_min 1 -vf scale=540:-2 -pix_fmt yuv420p "$OUT/$out"
}

enc  duck-float.mp4  -i "$SRC" -t "$FLOAT_END"
enc  duck-dive.mp4   -ss "$DIVE_START" -i "$SRC"
encw duck-float.webm -i "$SRC" -t "$FLOAT_END"
encw duck-dive.webm  -ss "$DIVE_START" -i "$SRC"
ffmpeg -y -v error -ss 1 -i "$OUT/duck-float.mp4" -frames:v 1 -q:v 4 "$OUT/duck-float.jpg"
ffmpeg -y -v error -ss 1 -i "$OUT/duck-dive.mp4"  -frames:v 1 -q:v 4 "$OUT/duck-dive.jpg"
ls -lh "$OUT"
