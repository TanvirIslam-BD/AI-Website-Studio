/**
 * Tiny colour helpers used by the theme engine.
 *
 * Deliberately dependency-free and pure: the same functions run on the server
 * (static export), in the preview route and in the editor, and they must always
 * produce byte-identical output.
 */

export type Rgb = { r: number; g: number; b: number };

const HEX_SHORT = /^#([\da-f])([\da-f])([\da-f])$/i;
const HEX_LONG = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i;

export function isHexColor(value: string): boolean {
  return HEX_SHORT.test(value.trim()) || HEX_LONG.test(value.trim());
}

export function hexToRgb(hex: string): Rgb {
  const value = hex.trim();
  const short = HEX_SHORT.exec(value);
  if (short) {
    return {
      r: parseInt(short[1] + short[1], 16),
      g: parseInt(short[2] + short[2], 16),
      b: parseInt(short[3] + short[3], 16),
    };
  }
  const long = HEX_LONG.exec(value);
  if (long) {
    return {
      r: parseInt(long[1], 16),
      g: parseInt(long[2], 16),
      b: parseInt(long[3], 16),
    };
  }
  // Unknown format: fall back to a neutral so rendering never breaks.
  return { r: 79, g: 70, b: 229 };
}

const clamp = (n: number, min = 0, max = 255) => Math.min(max, Math.max(min, n));

export function rgbToHex({ r, g, b }: Rgb): string {
  const part = (n: number) => clamp(Math.round(n)).toString(16).padStart(2, '0');
  return `#${part(r)}${part(g)}${part(b)}`;
}

/** `rgba()` string for a hex colour at the given alpha (0-1). */
export function withAlpha(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${Math.min(1, Math.max(0, alpha))})`;
}

/** Relative luminance per WCAG 2.1. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Picks whichever of light/dark text reads better on `background`. */
export function readableOn(background: string, light = '#ffffff', dark = '#0d0f14'): string {
  return contrastRatio(background, light) >= contrastRatio(background, dark) ? light : dark;
}

export function mix(a: string, b: string, weight = 0.5): string {
  const ca = hexToRgb(a);
  const cb = hexToRgb(b);
  const w = Math.min(1, Math.max(0, weight));
  return rgbToHex({
    r: ca.r + (cb.r - ca.r) * w,
    g: ca.g + (cb.g - ca.g) * w,
    b: ca.b + (cb.b - ca.b) * w,
  });
}

export const lighten = (hex: string, amount = 0.2) => mix(hex, '#ffffff', amount);
export const darken = (hex: string, amount = 0.2) => mix(hex, '#000000', amount);

/** True when a colour is dark enough that a surface built on it needs light text. */
export function isDark(hex: string): boolean {
  return luminance(hex) < 0.4;
}
