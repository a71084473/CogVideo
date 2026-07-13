# 故事分鏡背景生成 · Story → Storyboard Backgrounds

Write a text story, get **N background storyboard frames** (default 4). The
user types a free-form story (Chinese or English); the tool splits it into
shots, analyzes each shot's **time-of-day / setting / mood**, and paints a
matching background frame with the shot number and caption overlaid.

It works **out of the box with no GPU and no model weights** (a procedural
renderer), and exposes a clean seam to plug in the real **CogVideo / CogView2**
model when you have an A100 and the checkpoints.

## Install

```bash
pip install pillow gradio
```

## Web demo

**Zero-install / online:** open [`storyboard/web.html`](web.html) directly in a
browser — a self-contained, no-server page that segments and renders the whole
storyboard client-side (Canvas). Type a story, get 4 background frames, download
each as PNG.

**Gradio (Python) demo:**

```bash
python story_storyboard_demo.py
```

Open the printed URL, paste your story, press **生成背景分鏡图 🎨**, and get 4
background frames plus a shot list.

## Command line

```bash
python -m storyboard.generator --story "从前有座山，山里有座庙……" --out out/
python -m storyboard.generator --story-file story.txt --out out/ --num 6
```

## Library

```python
from storyboard import StoryboardGenerator

gen = StoryboardGenerator(num_shots=4)
for scene, image in gen.generate("清晨少年走进森林，深夜抵达城市。"):
    image.save(f"shot_{scene.index}.png")
    print(scene.index, scene.time, scene.setting, scene.moods, scene.caption)
```

## Architecture

| File | Responsibility |
|------|----------------|
| `segment.py`  | story text → N analyzed `Scene` shots (time/setting/mood) |
| `render.py`   | `Scene` → procedural PIL background frame |
| `backends.py` | pluggable image backends (`ProceduralBackend`, `CogVideoBackend`) |
| `generator.py`| orchestration + CLI |

## Using the real CogVideo / CogView2 model

`CogVideoBackend` takes any `generate_image(prompt) -> PIL.Image` callable, so
you can back each shot with a real keyframe from the model (requires an A100 and
CogVideo checkpoints — see the repo root README for setup):

```python
from storyboard import StoryboardGenerator, CogVideoBackend

def cogvideo_keyframe(prompt: str):
    # Run CogVideo/CogView2 stage-1 to produce one keyframe for `prompt`
    # (a Chinese caption + " 高清摄影"), decode it, and return a PIL.Image.
    ...

gen = StoryboardGenerator(backend=CogVideoBackend(cogvideo_keyframe), num_shots=4)
shots = gen.generate("深夜，他抵达灯火通明的城市。")
```

`Scene.as_prompt()` yields a CogVideo-style Chinese prompt for each shot.
```
