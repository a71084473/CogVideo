/** Splits display copy into glyphs: ALL CAPS, selected letters italic, "*" becomes a duck slot. */
export function toDisplayGlyphs(text, italic = []) {
  return [...text.toUpperCase()].map((char, i) =>
    char === '*' ? { char, italic: false, duck: true } : { char, italic: italic.includes(i) },
  );
}
