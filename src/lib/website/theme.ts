import { z } from 'zod';
import { isDark, readableOn, withAlpha, mix, darken } from './color';

/**
 * Brand kit -> CSS custom properties.
 *
 * Generated websites never depend on the studio's Tailwind config for colour,
 * type or radius: those come from CSS variables emitted by `themeToCssVars`.
 * Layout still uses Tailwind utility classes, which the static export loads
 * separately. That split is what lets one set of section components serve the
 * editor canvas, the preview route and the deployed site.
 */

export const RADIUS_SCALE = ['none', 'sm', 'md', 'lg', 'full'] as const;
export const BUTTON_STYLES = ['solid', 'outline', 'soft', 'pill'] as const;
export const DENSITIES = ['compact', 'comfortable', 'spacious'] as const;
export const THEME_MODES = ['light', 'dark'] as const;

const hex = z
  .string()
  .trim()
  .regex(/^#(?:[\da-fA-F]{3}|[\da-fA-F]{6})$/, 'Must be a hex colour such as #4f46e5');

export const themeSchema = z.object({
  primaryColor: hex.default('#4f46e5'),
  secondaryColor: hex.default('#0ea5e9'),
  background: hex.default('#ffffff'),
  surface: hex.default('#f6f7f9'),
  textColor: hex.default('#0d0f14'),
  mutedColor: hex.default('#5b6478'),
  borderColor: hex.default('#e6e8ee'),
  headingFont: z.string().min(1).default('Inter'),
  bodyFont: z.string().min(1).default('Inter'),
  radius: z.enum(RADIUS_SCALE).default('md'),
  buttonStyle: z.enum(BUTTON_STYLES).default('solid'),
  density: z.enum(DENSITIES).default('comfortable'),
  mode: z.enum(THEME_MODES).default('light'),
});

export type Theme = z.infer<typeof themeSchema>;
export const themePatchSchema = themeSchema.partial();
export type ThemePatch = z.infer<typeof themePatchSchema>;

export const DEFAULT_THEME: Theme = themeSchema.parse({});

/** Curated font set. Keeping it closed means the export can always self-host
 *  the right Google Fonts stylesheet and the AI can only pick real fonts. */
export const FONTS = [
  { name: 'Inter', stack: "'Inter', ui-sans-serif, system-ui, sans-serif", category: 'sans' },
  { name: 'Manrope', stack: "'Manrope', ui-sans-serif, system-ui, sans-serif", category: 'sans' },
  { name: 'Plus Jakarta Sans', stack: "'Plus Jakarta Sans', ui-sans-serif, sans-serif", category: 'sans' },
  { name: 'DM Sans', stack: "'DM Sans', ui-sans-serif, sans-serif", category: 'sans' },
  { name: 'Outfit', stack: "'Outfit', ui-sans-serif, sans-serif", category: 'sans' },
  { name: 'Poppins', stack: "'Poppins', ui-sans-serif, sans-serif", category: 'sans' },
  { name: 'Sora', stack: "'Sora', ui-sans-serif, sans-serif", category: 'sans' },
  { name: 'Space Grotesk', stack: "'Space Grotesk', ui-sans-serif, sans-serif", category: 'sans' },
  { name: 'IBM Plex Sans', stack: "'IBM Plex Sans', ui-sans-serif, sans-serif", category: 'sans' },
  { name: 'Playfair Display', stack: "'Playfair Display', ui-serif, Georgia, serif", category: 'serif' },
  { name: 'Fraunces', stack: "'Fraunces', ui-serif, Georgia, serif", category: 'serif' },
  { name: 'Lora', stack: "'Lora', ui-serif, Georgia, serif", category: 'serif' },
  { name: 'Libre Baskerville', stack: "'Libre Baskerville', ui-serif, Georgia, serif", category: 'serif' },
  { name: 'JetBrains Mono', stack: "'JetBrains Mono', ui-monospace, monospace", category: 'mono' },
] as const;

export const FONT_NAMES: string[] = FONTS.map((f) => f.name);

export function fontStack(name: string): string {
  return FONTS.find((f) => f.name === name)?.stack ?? FONTS[0].stack;
}

/** Google Fonts stylesheet URL for the fonts a theme actually uses. */
export function googleFontsHref(theme: Theme): string {
  const families = Array.from(new Set([theme.headingFont, theme.bodyFont]))
    .filter((name) => FONT_NAMES.includes(name))
    .map((name) => `family=${name.replace(/ /g, '+')}:wght@400;500;600;700;800`);
  if (families.length === 0) return '';
  return `https://fonts.googleapis.com/css2?${families.join('&')}&display=swap`;
}

const RADIUS_PX: Record<(typeof RADIUS_SCALE)[number], { sm: string; md: string; lg: string; pill: string }> = {
  none: { sm: '0px', md: '0px', lg: '0px', pill: '0px' },
  sm: { sm: '2px', md: '4px', lg: '6px', pill: '9999px' },
  md: { sm: '6px', md: '10px', lg: '16px', pill: '9999px' },
  lg: { sm: '10px', md: '16px', lg: '28px', pill: '9999px' },
  full: { sm: '9999px', md: '9999px', lg: '32px', pill: '9999px' },
};

const DENSITY_SPACING: Record<(typeof DENSITIES)[number], { sectionY: string; gap: string }> = {
  compact: { sectionY: '48px', gap: '20px' },
  comfortable: { sectionY: '80px', gap: '28px' },
  spacious: { sectionY: '120px', gap: '40px' },
};

/**
 * Derived palette. Everything a section component needs is resolved here once,
 * so components stay dumb and the light/dark variants can never drift.
 */
export function resolveTheme(theme: Theme) {
  const dark = theme.mode === 'dark';
  const background = dark && theme.background === '#ffffff' ? '#0d0f14' : theme.background;
  const surface = dark && theme.surface === '#f6f7f9' ? '#161922' : theme.surface;
  const text = dark && theme.textColor === '#0d0f14' ? '#f7f8fa' : theme.textColor;
  const muted = dark && theme.mutedColor === '#5b6478' ? '#9aa3b5' : theme.mutedColor;
  const border = dark && theme.borderColor === '#e6e8ee' ? '#262b38' : theme.borderColor;
  const radii = RADIUS_PX[theme.radius];
  const spacing = DENSITY_SPACING[theme.density];

  return {
    dark,
    background,
    surface,
    text,
    muted,
    border,
    primary: theme.primaryColor,
    primaryFg: readableOn(theme.primaryColor),
    primaryHover: dark ? mix(theme.primaryColor, '#ffffff', 0.14) : darken(theme.primaryColor, 0.12),
    primarySoft: withAlpha(theme.primaryColor, dark ? 0.2 : 0.1),
    secondary: theme.secondaryColor,
    secondaryFg: readableOn(theme.secondaryColor),
    /** Inverted band used by dark CTA / footer variants. */
    inverse: dark ? surface : mix(text, '#000000', 0.08),
    inverseFg: dark ? text : readableOn(mix(text, '#000000', 0.08)),
    radii,
    spacing,
    headingStack: fontStack(theme.headingFont),
    bodyStack: fontStack(theme.bodyFont),
  };
}

export type ResolvedTheme = ReturnType<typeof resolveTheme>;

/**
 * The single source of truth for theming. Returned as a plain record so it can
 * be spread into a React `style` prop or serialised into a `:root {}` block for
 * the static export.
 */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const t = resolveTheme(theme);
  return {
    '--ws-bg': t.background,
    '--ws-surface': t.surface,
    '--ws-text': t.text,
    '--ws-muted': t.muted,
    '--ws-border': t.border,
    '--ws-primary': t.primary,
    '--ws-primary-fg': t.primaryFg,
    '--ws-primary-hover': t.primaryHover,
    '--ws-primary-soft': t.primarySoft,
    '--ws-secondary': t.secondary,
    '--ws-secondary-fg': t.secondaryFg,
    '--ws-inverse': t.inverse,
    '--ws-inverse-fg': t.inverseFg,
    '--ws-radius-sm': t.radii.sm,
    '--ws-radius': t.radii.md,
    '--ws-radius-lg': t.radii.lg,
    '--ws-radius-pill': t.radii.pill,
    '--ws-section-y': t.spacing.sectionY,
    '--ws-gap': t.spacing.gap,
    '--ws-font-heading': t.headingStack,
    '--ws-font-body': t.bodyStack,
    '--ws-shadow': t.dark
      ? '0 20px 50px -24px rgba(0,0,0,0.7)'
      : '0 18px 44px -24px rgba(13,15,20,0.28)',
  };
}

export function cssVarsToText(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n');
}

/** Ready-made brand kits offered in the UI and used as AI few-shot targets. */
export const THEME_PRESETS = [
  {
    id: 'studio-indigo',
    name: 'Studio Indigo',
    patch: { primaryColor: '#4f46e5', secondaryColor: '#0ea5e9', headingFont: 'Inter', bodyFont: 'Inter', mode: 'light', radius: 'md' },
  },
  {
    id: 'editorial-noir',
    name: 'Editorial Noir',
    patch: { primaryColor: '#111111', secondaryColor: '#c8a96a', background: '#ffffff', surface: '#f4f2ee', headingFont: 'Playfair Display', bodyFont: 'Lora', mode: 'light', radius: 'none' },
  },
  {
    id: 'midnight-neon',
    name: 'Midnight Neon',
    patch: { primaryColor: '#6ee7b7', secondaryColor: '#818cf8', background: '#0b0f14', surface: '#141a23', textColor: '#e9eef7', mutedColor: '#9aa8bf', borderColor: '#232c3a', headingFont: 'Space Grotesk', bodyFont: 'Inter', mode: 'dark', radius: 'lg' },
  },
  {
    id: 'warm-clay',
    name: 'Warm Clay',
    patch: { primaryColor: '#b4552d', secondaryColor: '#3f6212', background: '#fdf9f4', surface: '#f5ece1', textColor: '#231a13', mutedColor: '#6d5a4b', borderColor: '#e6d8c8', headingFont: 'Fraunces', bodyFont: 'DM Sans', mode: 'light', radius: 'lg' },
  },
  {
    id: 'clinic-blue',
    name: 'Clinic Blue',
    patch: { primaryColor: '#0369a1', secondaryColor: '#0d9488', background: '#ffffff', surface: '#f1f7fb', headingFont: 'IBM Plex Sans', bodyFont: 'IBM Plex Sans', mode: 'light', radius: 'sm' },
  },
  {
    id: 'soft-pastel',
    name: 'Soft Pastel',
    patch: { primaryColor: '#db2777', secondaryColor: '#7c3aed', background: '#fffbfd', surface: '#fdf2f8', headingFont: 'Plus Jakarta Sans', bodyFont: 'Plus Jakarta Sans', mode: 'light', radius: 'full' },
  },
] satisfies Array<{ id: string; name: string; patch: ThemePatch }>;

export { isDark, readableOn, withAlpha };
