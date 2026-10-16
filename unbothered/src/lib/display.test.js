import { describe, expect, it } from 'vitest';
import { toDisplayGlyphs } from './display.js';

describe('Feature: display headline with italic letter swaps', () => {
  it('Given a word and italic positions, Then those letters are flagged italic', () => {
    expect(toDisplayGlyphs('SHIP', [1])).toEqual([
      { char: 'S', italic: false },
      { char: 'H', italic: true },
      { char: 'I', italic: false },
      { char: 'P', italic: false },
    ]);
  });
  it('Given lowercase input, Then it is shown in ALL CAPS', () => {
    expect(toDisplayGlyphs('ship').map((g) => g.char).join('')).toBe('SHIP');
  });
  it('Given the duck marker "*", Then that glyph becomes a duck slot', () => {
    expect(toDisplayGlyphs('SH*T')[2]).toEqual({ char: '*', italic: false, duck: true });
  });
});
