# -*- encoding: utf-8 -*-
"""
backends.py
~~~~~~~~~~~
Pluggable image backends for storyboard generation.

* :class:`ProceduralBackend` — default; paints an atmosphere-matched frame with
  :mod:`storyboard.render`.  No GPU, no weights, runs anywhere.
* :class:`CogVideoBackend` — adapter seam for the real model.  When a caller
  provides a ``generate_image(prompt) -> PIL.Image`` callable backed by
  CogVideo / CogView2 (A100 + weights required), each shot is produced by the
  actual model; otherwise construction fails loudly with guidance.
"""

from typing import Callable, Optional

from PIL import Image

from .render import render_scene
from .segment import Scene


class ImageBackend:
    """Abstract backend: map a :class:`Scene` to a PIL image."""

    name = "base"

    def generate(self, scene: Scene) -> Image.Image:  # pragma: no cover
        raise NotImplementedError


class ProceduralBackend(ImageBackend):
    """Always-available renderer used by default."""

    name = "procedural"

    def __init__(self, seed: Optional[int] = None):
        self.seed = seed

    def generate(self, scene: Scene) -> Image.Image:
        s = None if self.seed is None else self.seed + scene.index
        return render_scene(scene, seed=s)


class CogVideoBackend(ImageBackend):
    """Adapter for a real CogVideo/CogView2 keyframe generator.

    Parameters
    ----------
    generate_image:
        Callable taking a Chinese prompt string and returning a ``PIL.Image``.
        Wire this to the CogVideo pipeline's stage-1 keyframe output.  See
        ``storyboard/README.md`` for how to build one.
    """

    name = "cogvideo"

    def __init__(self, generate_image: Callable[[str], Image.Image]):
        if not callable(generate_image):
            raise ValueError(
                "CogVideoBackend requires a callable generate_image(prompt) -> "
                "PIL.Image backed by the CogVideo/CogView2 model (A100 + weights)."
            )
        self._gen = generate_image

    def generate(self, scene: Scene) -> Image.Image:
        return self._gen(scene.as_prompt())


def get_backend(name: str = "procedural", **kwargs) -> ImageBackend:
    name = (name or "procedural").lower()
    if name == "procedural":
        return ProceduralBackend(seed=kwargs.get("seed"))
    if name == "cogvideo":
        return CogVideoBackend(kwargs["generate_image"])
    raise ValueError(f"Unknown backend: {name!r} (use 'procedural' or 'cogvideo')")
