import { DisplayText } from './DisplayText.jsx';
import { DuckFeet } from './Icons.jsx';
import { Grid } from './Grid.jsx';

export function Footer() {
  return (
    <footer id="demo" className="relative overflow-hidden px-[4vw] pb-10 pt-28">
      <Grid cols={['4vw', 'calc(100% - 4vw)']} rows={['1px', 'calc(100% - 4.5rem)']} />
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.24em] text-volt">(04) — Your turn to relax</p>
      <h2 className="font-display text-[clamp(3rem,10vw,10rem)] leading-[0.85]">
        <DisplayText text="STAY UNBOTHERED." italic={[2, 9]} />
      </h2>
      <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <p className="max-w-md text-white/85">
          30-minute walkthrough with an engineer. Bring your worst on-call story — we will show you how it ends.
        </p>
        <a
          href="mailto:demo@unbothered.cloud"
          className="inline-flex w-fit items-center rounded-full bg-volt px-7 py-4 font-bold text-ink transition-transform hover:-translate-y-0.5"
        >
          Book your demo
        </a>
      </div>
      <div className="mt-24 flex items-center justify-between text-xs text-white/60">
        <span className="flex items-center gap-2">
          <DuckFeet className="h-3 w-5 text-volt" /> © {new Date().getFullYear()} Unbothered Cloud
        </span>
        <span>Calm above. Chaos handled below.</span>
      </div>
    </footer>
  );
}
