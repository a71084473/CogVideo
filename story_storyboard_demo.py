# -*- encoding: utf-8 -*-
"""
story_storyboard_demo.py
~~~~~~~~~~~~~~~~~~~~~~~~~
Gradio web demo: the user writes a text story, and CogVideo's storyboard tool
generates 4 background storyboard frames ("背景分鏡圖") for it.

Run::

    pip install gradio pillow
    python story_storyboard_demo.py

Then open the printed local URL. By default it uses the always-available
procedural renderer (no GPU needed). To generate frames with the real
CogVideo/CogView2 model, construct a :class:`storyboard.CogVideoBackend` and
pass it to :class:`StoryboardGenerator` (see storyboard/README.md).
"""

import gradio as gr

from storyboard import StoryboardGenerator

EXAMPLE = (
    "清晨，少年离开熟睡的村庄，独自走进茂密的森林。"
    "正午时分，他翻过陡峭的高山，远处出现了一片蔚蓝的大海。"
    "黄昏，他乘船横渡海洋，海面燃起金色的火光。"
    "深夜，他终于抵达灯火通明的城市，星空下高楼林立。"
)

generator = StoryboardGenerator(num_shots=4)


def make_storyboard(story: str, num_shots: int):
    story = (story or "").strip()
    if not story:
        raise gr.Error("请先写下你的故事文字！ / Please write your story first.")
    shots = generator.generate(story, num_shots=int(num_shots))
    gallery = [(img, f"#{sc.index} · {sc.time}/{sc.setting} — {sc.caption}")
               for sc, img in shots]
    outline = "\n".join(
        f"**分鏡 #{sc.index}**  ⏱ {sc.time}  🎬 {sc.setting}"
        + (f"  ✨ {'/'.join(sc.moods)}" if sc.moods else "")
        + f"\n> {sc.caption}"
        for sc, _ in shots
    )
    return gallery, outline


def build_demo():
    with gr.Blocks(title="CogVideo · 故事分鏡背景生成") as demo:
        gr.Markdown(
            "# 🎬 故事分鏡背景生成器\n"
            "自己写下一段文字故事，一键生成 **4 张背景分鏡图**。"
            "系统会自动把故事切分成若干镜头，并为每个镜头分析时间/场景/氛围，"
            "绘制对应的背景画面。"
        )
        with gr.Row():
            with gr.Column(scale=2):
                story = gr.Textbox(
                    label="✍️ 你的故事 / Your story",
                    placeholder="在这里写下你的文字故事……",
                    lines=10,
                    value=EXAMPLE,
                )
                num = gr.Slider(2, 8, value=4, step=1, label="分鏡数量 / Number of shots")
                btn = gr.Button("生成背景分鏡图 🎨", variant="primary")
            with gr.Column(scale=3):
                gallery = gr.Gallery(label="背景分鏡图 / Storyboard frames",
                                     columns=2, height=460, object_fit="cover")
                outline = gr.Markdown(label="分鏡脚本 / Shot list")
        btn.click(make_storyboard, inputs=[story, num], outputs=[gallery, outline])
        gr.Examples(examples=[[EXAMPLE, 4]], inputs=[story, num])
    return demo


if __name__ == "__main__":
    build_demo().launch(server_name="0.0.0.0")
