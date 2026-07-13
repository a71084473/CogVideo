# -*- encoding: utf-8 -*-
"""
generator.py
~~~~~~~~~~~~
Orchestrate: user story text -> N storyboard shots -> N background frames.

Usable as a library::

    from storyboard import StoryboardGenerator
    shots = StoryboardGenerator().generate("从前有座山……")
    for scene, image in shots:
        image.save(f"shot_{scene.index}.png")

or from the command line::

    python -m storyboard.generator --story "从前有座山……" --out out/
    python -m storyboard.generator --story-file story.txt --out out/ --num 4
"""

import argparse
import os
import sys
from typing import List, Optional, Tuple

from PIL import Image

from .backends import ImageBackend, ProceduralBackend
from .segment import Scene, segment_story


class StoryboardGenerator:
    def __init__(self, backend: Optional[ImageBackend] = None, num_shots: int = 4):
        self.backend = backend or ProceduralBackend()
        self.num_shots = num_shots

    def segment(self, story: str, num_shots: Optional[int] = None) -> List[Scene]:
        return segment_story(story, n=num_shots or self.num_shots)

    def generate(self, story: str, num_shots: Optional[int] = None
                 ) -> List[Tuple[Scene, Image.Image]]:
        scenes = self.segment(story, num_shots)
        return [(sc, self.backend.generate(sc)) for sc in scenes]

    def generate_to_dir(self, story: str, out_dir: str,
                        num_shots: Optional[int] = None) -> List[str]:
        os.makedirs(out_dir, exist_ok=True)
        paths = []
        for scene, image in self.generate(story, num_shots):
            p = os.path.join(out_dir, f"shot_{scene.index:02d}.png")
            image.save(p)
            paths.append(p)
        return paths


def _read_story(args) -> str:
    if args.story_file:
        with open(args.story_file, "r", encoding="utf-8") as f:
            return f.read()
    return args.story or ""


def main(argv=None):
    p = argparse.ArgumentParser(
        description="Generate background storyboard frames from a text story.")
    src = p.add_mutually_exclusive_group(required=True)
    src.add_argument("--story", type=str, help="story text (inline)")
    src.add_argument("--story-file", type=str, help="path to a UTF-8 story file")
    p.add_argument("--out", type=str, default="storyboard_out", help="output directory")
    p.add_argument("--num", type=int, default=4, help="number of shots (default 4)")
    args = p.parse_args(argv)

    story = _read_story(args).strip()
    if not story:
        p.error("empty story")

    gen = StoryboardGenerator(num_shots=args.num)
    paths = gen.generate_to_dir(story, args.out, num_shots=args.num)
    for scene, path in zip(gen.segment(story, args.num), paths):
        print(f"[#{scene.index}] {scene.time:>5} / {scene.setting:<8} -> {path}  ({scene.caption})")
    print(f"\n完成！{len(paths)} 張分鏡背景圖已輸出到: {os.path.abspath(args.out)}")


if __name__ == "__main__":
    sys.exit(main())
