# -*- encoding: utf-8 -*-
"""
segment.py
~~~~~~~~~~
Turn a free-form story (Chinese or English) written by the user into a fixed
number of storyboard shots ("分鏡").  Each shot carries a short caption plus a
lightweight semantic analysis (time-of-day / setting / mood) that the renderer
uses to paint an appropriate background frame.

The segmentation is deliberately dependency-free so it runs anywhere, with or
without the heavy CogVideo model.
"""

import re
from dataclasses import dataclass, field
from typing import List, Dict

# Sentence terminators for both Chinese and Latin scripts.
_SENT_SPLIT = re.compile(r"(?<=[。！？!?\.\n；;])")

# --- Keyword tables -------------------------------------------------------
# Each entry maps a canonical tag to the substrings (zh + en) that trigger it.
TIME_KEYWORDS: Dict[str, List[str]] = {
    "night": ["夜", "晚", "月", "星", "深夜", "黑夜", "night", "moon", "star", "midnight"],
    "dawn":  ["黎明", "清晨", "日出", "拂晓", "早晨", "dawn", "sunrise", "morning"],
    "dusk":  ["黄昏", "傍晚", "日落", "夕阳", "dusk", "sunset", "evening", "twilight"],
    # Explicit daytime words so a noon shot resolves to "day" instead of
    # inheriting the story's global fallback (which may be night).
    "day":   ["正午", "中午", "晌午", "白天", "日间", "noon", "midday", "daytime"],
}

SETTING_KEYWORDS: Dict[str, List[str]] = {
    "sea":     ["海", "海洋", "大海", "海边", "波浪", "浪", "sea", "ocean", "beach", "wave", "coast"],
    # Avoid bare "林" — it false-matches words like "林立"/"密林" contexts.
    "forest":  ["森林", "树林", "丛林", "树", "林间", "forest", "woods", "tree", "jungle"],
    "mountain":["山", "山峰", "群山", "高山", "mountain", "hill", "peak", "cliff"],
    "city":    ["城市", "都市", "街道", "大厦", "高楼", "楼", "城", "city", "street", "building", "town", "skyline"],
    "desert":  ["沙漠", "荒漠", "戈壁", "desert", "dune", "sand"],
    "snow":    ["雪", "冰", "雪山", "冰川", "snow", "ice", "frozen", "glacier"],
    "room":    ["房间", "屋", "室内", "房", "客厅", "卧室", "room", "indoor", "house", "hall"],
    "field":   ["草原", "田野", "原野", "草地", "平原", "field", "grass", "meadow", "plain", "prairie"],
    "river":   ["河", "江", "溪", "湖", "river", "lake", "stream"],
    "space":   ["宇宙", "太空", "星空", "银河", "space", "galaxy", "cosmos", "universe"],
}

MOOD_KEYWORDS: Dict[str, List[str]] = {
    "fire":  ["火", "燃烧", "火焰", "烈焰", "fire", "flame", "burning", "blaze"],
    "rain":  ["雨", "下雨", "暴雨", "rain", "storm", "rainy"],
    "fog":   ["雾", "薄雾", "迷雾", "fog", "mist", "haze"],
    "magic": ["魔法", "光芒", "发光", "神秘", "magic", "glow", "mystic", "aurora"],
}


@dataclass
class Scene:
    """A single storyboard shot."""
    index: int                      # 1-based shot number
    caption: str                    # short human-readable description
    text: str                       # the raw story text assigned to this shot
    time: str = "day"               # day | dawn | dusk | night
    setting: str = "field"          # one of SETTING_KEYWORDS keys
    moods: List[str] = field(default_factory=list)

    def as_prompt(self) -> str:
        """A CogVideo/CogView2-style prompt for the real-model backend."""
        return f"{self.caption} 高清摄影".strip()


def _contains(text: str, word: str) -> bool:
    """Substring match for CJK words; word-boundary match for ASCII words.

    CJK has no spaces so substring matching is correct, but ASCII substrings
    over-match (e.g. "night" inside "knight"), so ASCII keywords are anchored
    to word boundaries and matched case-insensitively.
    """
    if word.isascii():
        return re.search(rf"\b{re.escape(word)}\b", text, re.IGNORECASE) is not None
    return word in text


def _first_match(text: str, table: Dict[str, List[str]], default: str) -> str:
    for tag, words in table.items():
        if any(_contains(text, w) for w in words):
            return tag
    return default


def _all_matches(text: str, table: Dict[str, List[str]]) -> List[str]:
    return [tag for tag, words in table.items()
            if any(_contains(text, w) for w in words)]


def _split_sentences(story: str) -> List[str]:
    parts = [s.strip() for s in _SENT_SPLIT.split(story) if s and s.strip()]
    return parts


def _distribute(sentences: List[str], n: int) -> List[str]:
    """Group sentences into n roughly balanced chunks (preserving order)."""
    if not sentences:
        return [""] * n
    if len(sentences) <= n:
        # Pad by repeating the last sentence so we always return n shots.
        chunks = list(sentences)
        while len(chunks) < n:
            chunks.append(sentences[-1])
        return chunks
    chunks, size = [], len(sentences) / n
    for i in range(n):
        lo = round(i * size)
        hi = round((i + 1) * size)
        chunks.append(" ".join(sentences[lo:hi]).strip())
    return chunks


def _make_caption(text: str, limit: int = 40) -> str:
    text = re.sub(r"\s+", " ", text).strip()
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip("，,。.、 ") + "…"


def segment_story(story: str, n: int = 4) -> List[Scene]:
    """Split ``story`` into ``n`` analyzed storyboard shots.

    Analysis is computed per-shot but falls back to the whole-story context so
    that a shot with no explicit time/setting words still inherits the story's
    overall atmosphere.
    """
    story = (story or "").strip()
    global_time = _first_match(story, TIME_KEYWORDS, "day")
    global_setting = _first_match(story, SETTING_KEYWORDS, "field")

    chunks = _distribute(_split_sentences(story), n)
    scenes: List[Scene] = []
    for i, chunk in enumerate(chunks, start=1):
        scenes.append(
            Scene(
                index=i,
                caption=_make_caption(chunk) or f"分鏡 {i}",
                text=chunk,
                time=_first_match(chunk, TIME_KEYWORDS, global_time),
                setting=_first_match(chunk, SETTING_KEYWORDS, global_setting),
                moods=_all_matches(chunk, MOOD_KEYWORDS),
            )
        )
    return scenes
