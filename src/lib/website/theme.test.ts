import { describe, expect, it } from 'vitest';
import { contrastRatio, readableOn } from './color';
import { FONT_NAMES, THEME_PRESETS, resolveTheme, themeSchema } from './theme';

/**
 * The presets, checked rather than eyeballed.
 *
 * A preset is a starting point someone accepts without thinking about it, so an
 * unreadable one ships into every site built from it. These are the properties
 * that are easy to get wrong by eye and cheap to verify:
 *
 * - text has to be readable on the ground it sits on
 * - so does the accent, which paints eyebrows and links
 * - the accent has to work on *both* grounds, background and surface, because
 *   sections alternate between them
 * - a font has to exist in the registry, or it silently renders as Inter and
 *   is never requested from Google
 *
 * The surface is the harder of the two grounds and the one easy to forget. Two
 * presets shipped passing on their background and failing on their surface -
 * `soft-pastel` at 4.21 and `warm-clay` at 4.20 - which is what this file is
 * for.
 */

/** WCAG AA for normal-size text. Eyebrows are 12px, so the small-text bar applies. */
const AA = 4.5;

const ratio = (a: string, b: string) => Number(contrastRatio(a, b).toFixed(2));

const presets = THEME_PRESETS.map((preset) => {
  const theme = themeSchema.parse(preset.patch);
  return { id: preset.id, name: preset.name, theme, resolved: resolveTheme(theme) };
});

describe.each(presets)('$name', ({ theme }) => {
  it('sets body text readably on the page background', () => {
    expect(ratio(theme.textColor, theme.background)).toBeGreaterThanOrEqual(AA);
  });

  it('sets body text readably on the surface', () => {
    expect(ratio(theme.textColor, theme.surface)).toBeGreaterThanOrEqual(AA);
  });

  /**
   * The accent is not decoration. Eyebrows and links are painted in it, at 12px
   * and uppercase, which is the least forgiving text on the page.
   */
  it('has an accent readable on the page background', () => {
    expect(ratio(theme.primaryColor, theme.background)).toBeGreaterThanOrEqual(AA);
  });

  it('has an accent readable on the surface, the harder of the two', () => {
    expect(ratio(theme.primaryColor, theme.surface)).toBeGreaterThanOrEqual(AA);
  });

  /** Whatever `readableOn` picks for a solid accent button has to clear the bar too. */
  it('puts a readable label on a solid accent button', () => {
    expect(ratio(readableOn(theme.primaryColor), theme.primaryColor)).toBeGreaterThanOrEqual(AA);
  });

  /**
   * A family missing from the registry is not an error anywhere: `fontStack`
   * falls back to Inter and `googleFontsHrefFor` filters it out, so the preset
   * renders in the wrong face and nothing says so.
   */
  it('names fonts the registry knows, so they are actually loaded', () => {
    expect(FONT_NAMES).toContain(theme.headingFont);
    expect(FONT_NAMES).toContain(theme.bodyFont);
  });
});

describe('the preset list', () => {
  it('has no duplicate ids, which would make one unreachable', () => {
    const ids = THEME_PRESETS.map((preset) => preset.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('parses every patch against the theme schema', () => {
    for (const preset of THEME_PRESETS) {
      expect(() => themeSchema.parse(preset.patch)).not.toThrow();
    }
  });
});
