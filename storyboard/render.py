# -*- encoding: utf-8 -*-
"""
render.py
~~~~~~~~~
Procedurally paint a background storyboard frame for a :class:`Scene`.

This is the default, always-available image backend: it needs no GPU and no
model weights, yet it produces a distinct, atmosphere-matched background for
every shot (sky gradient + celestial body + layered scenery + mood effects)
with the shot number and caption overlaid, so a user gets a real visual
storyboard from their text immediately.
"""

import glob
import math
import os
import random
from typing import List, Tuple

from PIL import Image, ImageDraw, ImageFont

from .segment import Scene

# 16:9 storyboard frame.
W, H = 768, 432

# --- Fonts ----------------------------------------------------------------
_CJK_FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/truetype/arphic/uming.ttc",
]
_LATIN_FONT_CANDIDATES = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]


def _find_font() -> str:
    for path in _CJK_FONT_CANDIDATES + _LATIN_FONT_CANDIDATES:
        if os.path.exists(path):
            return path
    hits = glob.glob("/usr/share/fonts/**/*.tt?", recursive=True)
    return hits[0] if hits else ""


_FONT_PATH = _find_font()


def _font(size: int) -> ImageFont.FreeTypeFont:
    if _FONT_PATH:
        try:
            return ImageFont.truetype(_FONT_PATH, size)
        except Exception:
            pass
    return ImageFont.load_default()


# --- Palettes -------------------------------------------------------------
# Sky top/bottom gradient colours per time-of-day.
SKY: dict = {
    "day":  ((104, 176, 235), (204, 232, 248)),
    "dawn": ((60, 70, 120), (245, 190, 150)),
    "dusk": ((44, 40, 84), (240, 140, 96)),
    "night": ((8, 12, 40), (28, 40, 84)),
}
# Scenery base colour (near horizon) per setting.
GROUND: dict = {
    "sea":      (36, 92, 130),
    "forest":   (34, 78, 46),
    "mountain": (78, 84, 96),
    "city":     (54, 58, 74),
    "desert":   (196, 160, 104),
    "snow":     (222, 230, 240),
    "room":     (70, 58, 52),
    "field":    (86, 132, 68),
    "river":    (60, 110, 120),
    "space":    (10, 8, 24),
}


def _lerp(a: Tuple[int, int, int], b: Tuple[int, int, int], t: float) -> Tuple[int, int, int]:
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def _shade(c: Tuple[int, int, int], f: float) -> Tuple[int, int, int]:
    return tuple(max(0, min(255, int(v * f))) for v in c)


def _vertical_gradient(draw: ImageDraw.ImageDraw, top, bottom, y0: int, y1: int):
    span = max(1, y1 - y0)
    for y in range(y0, y1):
        draw.line([(0, y), (W, y)], fill=_lerp(top, bottom, (y - y0) / span))


# --- Scenery elements -----------------------------------------------------
def _draw_stars(draw, rng, count, y_max):
    for _ in range(count):
        x, y = rng.randint(0, W), rng.randint(0, y_max)
        r = rng.choice([0, 0, 1])
        b = rng.randint(160, 255)
        draw.ellipse([x - r, y - r, x + r, y + r], fill=(b, b, min(255, b + 20)))


def _draw_celestial(draw, scene: Scene, horizon: int, rng):
    cx, cy = int(W * 0.74), int(horizon * 0.42)
    if scene.time == "night":
        draw.ellipse([cx - 34, cy - 34, cx + 34, cy + 34], fill=(238, 240, 220))
        draw.ellipse([cx - 20, cy - 40, cx + 12, cy - 8],
                     fill=SKY["night"][0])  # crescent bite
    elif scene.time == "day":
        for r, col in ((60, (255, 244, 200)), (40, (255, 236, 150)), (26, (255, 250, 220))):
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
    else:  # dawn / dusk — big low sun
        cy = int(horizon * 0.85)
        for r, col in ((70, (255, 210, 150)), (48, (255, 176, 110)), (30, (255, 236, 190))):
            draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)


def _draw_mountains(draw, horizon, base, rng, layers=2):
    for layer in range(layers):
        f = 0.55 + 0.25 * layer
        col = _shade(base, f)
        top_y = horizon - int((layers - layer) * 46) - rng.randint(0, 24)
        pts = [(0, horizon)]
        x = 0
        while x <= W:
            peak = top_y + rng.randint(-30, 30)
            pts.append((x, max(0, peak)))
            x += rng.randint(90, 150)
        pts.append((W, horizon))
        draw.polygon(pts, fill=col)


def _draw_sea(img, draw, horizon, base, sky_bottom, rng):
    # Reflective water below the horizon.
    for y in range(horizon, H):
        t = (y - horizon) / max(1, H - horizon)
        col = _lerp(_shade(sky_bottom, 0.7), _shade(base, 1.05), t)
        draw.line([(0, y), (W, y)], fill=col)
    for _ in range(70):
        y = rng.randint(horizon + 6, H - 4)
        x = rng.randint(0, W - 40)
        w = rng.randint(10, 46)
        draw.line([(x, y), (x + w, y)], fill=_shade(base, 1.4))


def _draw_forest(draw, horizon, base, rng):
    ground = _shade(base, 0.9)
    draw.rectangle([0, horizon, W, H], fill=ground)
    for _ in range(46):
        x = rng.randint(-10, W)
        h = rng.randint(50, 150)
        top = horizon - h
        col = _shade(base, rng.uniform(0.7, 1.15))
        draw.polygon([(x - 22, horizon), (x + 22, horizon), (x, top)], fill=col)
        draw.rectangle([x - 3, horizon, x + 3, horizon + 8], fill=_shade(base, 0.5))


def _draw_city(draw, horizon, base, scene, rng):
    draw.rectangle([0, horizon, W, H], fill=_shade(base, 0.7))
    x = 0
    lit = scene.time in ("night", "dusk")
    while x < W:
        w = rng.randint(34, 72)
        h = rng.randint(60, 190)
        top = horizon - h
        col = _shade(base, rng.uniform(0.8, 1.2))
        draw.rectangle([x, top, x + w, horizon], fill=col)
        if lit:
            for wy in range(top + 8, horizon - 6, 16):
                for wx in range(x + 6, x + w - 6, 14):
                    if rng.random() < 0.5:
                        draw.rectangle([wx, wy, wx + 6, wy + 8], fill=(255, 214, 128))
        x += w + rng.randint(4, 14)


def _draw_desert(draw, horizon, base, rng):
    for y in range(horizon, H):
        t = (y - horizon) / max(1, H - horizon)
        draw.line([(0, y), (W, y)], fill=_lerp(base, _shade(base, 0.75), t))
    for layer in range(3):
        pts = [(0, H)]
        x, y0 = 0, horizon + 20 + layer * 40
        while x <= W:
            pts.append((x, y0 + int(20 * math.sin(x / 90.0 + layer))))
            x += 24
        pts += [(W, H)]
        draw.polygon(pts, fill=_shade(base, 0.85 + 0.1 * layer))


def _draw_plain(draw, horizon, base, rng):
    for y in range(horizon, H):
        t = (y - horizon) / max(1, H - horizon)
        draw.line([(0, y), (W, y)], fill=_lerp(_shade(base, 1.1), _shade(base, 0.7), t))


def _draw_space(draw, rng):
    _draw_stars(draw, rng, 260, H)
    for _ in range(3):
        cx, cy = rng.randint(0, W), rng.randint(0, H)
        r = rng.randint(30, 90)
        col = rng.choice([(120, 80, 160), (70, 90, 170), (160, 90, 120)])
        for rr in range(r, 0, -6):
            a = int(60 * rr / r)
            draw.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], fill=_shade(col, 0.5 + rr / (2 * r)))


# --- Mood overlays --------------------------------------------------------
def _apply_fog(img, rng):
    fog = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    fd = ImageDraw.Draw(fog)
    for _ in range(6):
        y = rng.randint(int(H * 0.4), H)
        fd.rectangle([0, y, W, y + rng.randint(20, 60)], fill=(220, 220, 225, 40))
    return Image.alpha_composite(img.convert("RGBA"), fog).convert("RGB")


def _apply_rain(draw, rng):
    for _ in range(220):
        x, y = rng.randint(0, W), rng.randint(0, H)
        draw.line([(x, y), (x - 4, y + 14)], fill=(180, 195, 215))


def _apply_fire_glow(img, rng):
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for _ in range(40):
        x = rng.randint(0, W)
        y = rng.randint(int(H * 0.55), H)
        r = rng.randint(4, 16)
        gd.ellipse([x - r, y - r, x + r, y + r],
                   fill=(255, rng.randint(120, 190), 40, 120))
    return Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")


def _apply_magic(img, rng):
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glow)
    for _ in range(90):
        x, y = rng.randint(0, W), rng.randint(0, int(H * 0.75))
        r = rng.randint(1, 4)
        c = rng.choice([(140, 220, 255, 150), (200, 160, 255, 150), (160, 255, 200, 150)])
        gd.ellipse([x - r, y - r, x + r, y + r], fill=c)
    return Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")


# --- Caption band ---------------------------------------------------------
def _wrap(text: str, font, draw, max_w: int) -> List[str]:
    lines, cur = [], ""
    for ch in text:
        if ch == "\n":
            lines.append(cur); cur = ""; continue
        trial = cur + ch
        if draw.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            lines.append(cur); cur = ch
    if cur:
        lines.append(cur)
    return lines[:3]


def _draw_caption(img, scene: Scene):
    draw = ImageDraw.Draw(img, "RGBA")
    band_h = 96
    draw.rectangle([0, H - band_h, W, H], fill=(0, 0, 0, 150))
    # Shot-number badge.
    badge = _font(26)
    tag = f"#{scene.index}"
    draw.rectangle([16, H - band_h + 14, 16 + 58, H - band_h + 14 + 40],
                   fill=(255, 200, 80))
    draw.text((28, H - band_h + 20), tag, font=badge, fill=(30, 24, 10))
    # Caption text.
    cfont = _font(22)
    tx = 92
    for i, line in enumerate(_wrap(scene.caption, cfont, draw, W - tx - 24)):
        draw.text((tx, H - band_h + 16 + i * 26), line, font=cfont, fill=(245, 245, 245))
    return img


# --- Public entry point ---------------------------------------------------
def render_scene(scene: Scene, seed: int = None) -> Image.Image:
    """Render ``scene`` into a 768x432 PIL background storyboard frame."""
    rng = random.Random(seed if seed is not None else (scene.index * 7919 + len(scene.text)))
    sky_top, sky_bottom = SKY.get(scene.time, SKY["day"])
    base = GROUND.get(scene.setting, GROUND["field"])
    horizon = int(H * (0.60 if scene.setting in ("sea", "river") else 0.66))

    img = Image.new("RGB", (W, H), sky_bottom)
    draw = ImageDraw.Draw(img)

    if scene.setting == "space":
        _draw_space(draw, rng)
    else:
        _vertical_gradient(draw, sky_top, sky_bottom, 0, horizon)
        if scene.time == "night":
            _draw_stars(draw, rng, 120, horizon)
        _draw_celestial(draw, scene, horizon, rng)

        if scene.setting == "mountain":
            _draw_mountains(draw, horizon, base, rng, layers=3)
            _draw_plain(draw, horizon, base, rng)
        elif scene.setting == "sea" or scene.setting == "river":
            _draw_mountains(draw, horizon, GROUND["mountain"], rng, layers=1)
            _draw_sea(img, draw, horizon, base, sky_bottom, rng)
        elif scene.setting == "forest":
            _draw_mountains(draw, horizon, GROUND["mountain"], rng, layers=1)
            _draw_forest(draw, horizon, base, rng)
        elif scene.setting == "city":
            _draw_city(draw, horizon, base, scene, rng)
        elif scene.setting == "desert":
            _draw_desert(draw, horizon, base, rng)
        elif scene.setting == "snow":
            _draw_mountains(draw, horizon, base, rng, layers=3)
            _draw_plain(draw, horizon, base, rng)
        else:  # field / room / default
            _draw_mountains(draw, horizon, GROUND["mountain"], rng, layers=1)
            _draw_plain(draw, horizon, base, rng)

    # Mood effects.
    if "rain" in scene.moods:
        _apply_rain(draw, rng)
    if "fog" in scene.moods:
        img = _apply_fog(img, rng)
    if "fire" in scene.moods:
        img = _apply_fire_glow(img, rng)
    if "magic" in scene.moods:
        img = _apply_magic(img, rng)

    return _draw_caption(img, scene)
