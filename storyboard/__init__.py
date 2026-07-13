# -*- encoding: utf-8 -*-
"""Story -> storyboard background frames for CogVideo.

Write a text story, get N (default 4) atmosphere-matched background storyboard
frames. Works out of the box with a procedural renderer; plug in the real
CogVideo/CogView2 model via :class:`CogVideoBackend` when weights are available.
"""

from .backends import CogVideoBackend, ImageBackend, ProceduralBackend, get_backend
from .generator import StoryboardGenerator
from .render import render_scene
from .segment import Scene, segment_story

__all__ = [
    "StoryboardGenerator",
    "segment_story",
    "Scene",
    "render_scene",
    "ImageBackend",
    "ProceduralBackend",
    "CogVideoBackend",
    "get_backend",
]
