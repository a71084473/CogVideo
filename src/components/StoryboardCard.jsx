import { sceneByStage } from './StoryboardIllustrations.jsx';

export default function StoryboardCard({ frame, index }) {
  const Scene = sceneByStage[frame.stage];

  return (
    <article
      className="animate-slide-up-fade group rounded-[2rem] border border-neutral-200 bg-white/90 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ animationDelay: `${index * 110}ms` }}
    >
      <div className="aspect-[16/10] overflow-hidden rounded-[1.5rem] border border-neutral-900/15 bg-white p-3">
        <Scene />
      </div>
      <div className="px-2 pb-2 pt-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold tracking-tight text-neutral-950">{frame.title}</h3>
          <span className="rounded-full border border-neutral-300 px-3 py-1 text-xs font-medium text-neutral-600">{frame.stage}</span>
        </div>
        <p className="text-sm leading-6 text-neutral-600">{frame.description}</p>
        <p className="mt-4 border-t border-dashed border-neutral-200 pt-3 text-xs leading-5 text-neutral-400">Prompt：{frame.visualPrompt}</p>
      </div>
    </article>
  );
}
