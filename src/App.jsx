import { useMemo, useState } from 'react';
import StoryboardCard from './components/StoryboardCard.jsx';
import { generateStoryboard } from './lib/generateStoryboard.js';

const exampleSpeech = '我走進老家的房間，窗邊的椅子仍然面向午後的光，走廊盡頭傳來雨聲，像是某個還沒說完的告別。';

export default function App() {
  const [storyText, setStoryText] = useState('');
  const [frames, setFrames] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const canGenerate = useMemo(() => storyText.trim().length > 0, [storyText]);

  const handleVoiceInput = () => {
    setError('');
    setIsListening(true);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-TW';
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript) setStoryText((current) => `${current}${current ? '\n' : ''}${transcript}`);
      };
      recognition.onerror = () => setStoryText((current) => current || exampleSpeech);
      recognition.onend = () => setIsListening(false);
      recognition.start();
      return;
    }

    window.setTimeout(() => {
      setStoryText((current) => current || exampleSpeech);
      setIsListening(false);
    }, 1400);
  };

  const handleGenerate = () => {
    if (!canGenerate) {
      setError('請先輸入或錄製你的故事。');
      return;
    }

    setError('');
    setIsGenerating(true);
    setFrames([]);

    window.setTimeout(() => {
      setFrames(generateStoryboard(storyText));
      setIsGenerating(false);
    }, 900);
  };

  return (
    <main className="min-h-screen bg-[#f7f7f4] text-neutral-950">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between border-b border-neutral-200 pb-5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-neutral-900 bg-neutral-950 text-white shadow-sm">
              <span className="text-lg">✦</span>
            </div>
            <span className="text-base font-semibold tracking-tight">Story Frame Lab</span>
          </div>
          <nav className="hidden text-sm text-neutral-500 sm:block">Voice / Text / Storyboard</nav>
        </header>

        <section className="grid flex-1 place-items-center py-14 lg:py-20">
          <div className="w-full max-w-5xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-neutral-500 shadow-sm">
              <span>✦</span> Background-only AI storyboard prototype
            </div>
            <h1 className="mx-auto max-w-4xl text-4xl font-semibold tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl">
              把你的故事，轉成沒有主角的黑白分鏡
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-neutral-600 sm:text-lg">
              用聲音或文字輸入故事，系統會依照起、承、轉、合，生成只保留背景與情緒的 storyboard wireframe。
            </p>

            <div className="mx-auto mt-10 max-w-3xl rounded-[2rem] border border-neutral-200 bg-white/85 p-3 text-left shadow-xl shadow-neutral-200/70 backdrop-blur">
              <textarea
                className="min-h-56 w-full resize-none rounded-[1.5rem] border border-neutral-200 bg-neutral-50/70 p-6 text-base leading-7 text-neutral-900 outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:bg-white"
                value={storyText}
                onChange={(event) => setStoryText(event.target.value)}
                placeholder="輸入你的故事，例如：有一天，我回到老家，發現房間裡的東西都還停留在小時候……"
              />

              <div className="flex flex-col gap-3 p-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  disabled={isListening}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-medium text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950 disabled:cursor-wait disabled:bg-neutral-100"
                >
                  <span aria-hidden="true">🎙</span> {isListening ? '正在聆聽中…' : '語音輸入'}
                </button>

                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-neutral-900/15 transition hover:-translate-y-0.5 hover:bg-neutral-800 disabled:cursor-wait disabled:bg-neutral-500"
                >
                  <span aria-hidden="true">✦</span> {isGenerating ? '正在拆解故事結構…' : '生成分鏡'}
                </button>
              </div>

              {error && <p className="px-4 pb-3 text-sm font-medium text-neutral-900">{error}</p>}
            </div>
          </div>
        </section>

        {(isGenerating || frames.length > 0) && (
          <section className="pb-16">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.22em] text-neutral-400">Storyboard Output</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">起、承、轉、合</h2>
              </div>
              {isGenerating && <p className="text-sm text-neutral-500">正在拆解故事結構…</p>}
            </div>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {frames.map((frame, index) => (
                <StoryboardCard key={frame.stage} frame={frame} index={index} />
              ))}
            </div>
          </section>
        )}

        <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-400">
          Background-only storyboard prototype
        </footer>
      </div>
    </main>
  );
}
