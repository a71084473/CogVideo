import { toDisplayGlyphs } from '../lib/display.js';
import { Duck } from './Icons.jsx';

/**
 * Serif ALL-CAPS display copy with a few letters swapped to italic.
 * Screen readers get the plain text; the styled glyphs are hidden from them.
 */
export function DisplayText({ text, italic = [], srText = text, className = '' }) {
  return (
    <>
      {srText && <span className="sr-only">{srText}</span>}
      <span aria-hidden="true" className={className}>
        {toDisplayGlyphs(text, italic).map((g, i) => {
          if (g.duck) {
            return (
              <Duck
                key={i}
                data-testid="duck-i"
                className="mx-[0.02em] inline-block h-[0.62em] w-[0.62em] -translate-y-[0.02em] align-baseline drop-shadow-[0_4px_10px_rgba(13,43,53,0.35)]"
              />
            );
          }
          if (g.char === ' ') return ' ';
          return g.italic ? (
            <span key={i} className="glyph-italic">
              {g.char}
            </span>
          ) : (
            <span key={i}>{g.char}</span>
          );
        })}
      </span>
    </>
  );
}
