# -*- encoding: utf-8 -*-
"""Smoke tests for the storyboard feature. Run: python -m storyboard.test_storyboard"""

from storyboard import StoryboardGenerator, get_backend, segment_story
from storyboard.render import H, W


def test_segment_always_returns_n_shots():
    for story in ["", "只有一句话。", "第一句。第二句。第三句。第四句。第五句。第六句。"]:
        assert len(segment_story(story, 4)) == 4
        assert len(segment_story(story, 6)) == 6


def test_analysis_tags():
    scenes = segment_story("清晨走进森林。深夜抵达灯火通明的城市。", 2)
    assert scenes[0].time == "dawn" and scenes[0].setting == "forest"
    assert scenes[1].time == "night" and scenes[1].setting == "city"


def test_english_word_boundaries():
    # "knight" must not trigger the "night" keyword.
    sc = segment_story("At dawn a knight crossed the desert.", 1)[0]
    assert sc.time == "dawn" and sc.setting == "desert"


def test_generate_produces_images():
    shots = StoryboardGenerator(backend=get_backend("procedural"), num_shots=4).generate(
        "清晨的森林，正午的大海，黄昏的城市，深夜的星空。")
    assert len(shots) == 4
    for scene, img in shots:
        assert img.size == (W, H)
        assert scene.caption


if __name__ == "__main__":
    fns = [v for k, v in sorted(globals().items()) if k.startswith("test_")]
    for fn in fns:
        fn()
        print(f"ok  {fn.__name__}")
    print(f"\n{len(fns)} tests passed")
