import type { Config } from 'tailwindcss';

/**
 * Studio (app chrome) design tokens live here.
 * Generated *websites* are themed at runtime via CSS variables so that the
 * same renderer can be reused for the editor canvas, the preview route and
 * the static export. See src/lib/website/theme.ts.
 */
const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        /**
         * Monochrome identity. These are Tailwind's neutral values, which are
         * exactly the specified brand palette (#fafafa / #e5e5e5 / #737373 /
         * #171717 / #0a0a0a), so the whole product shares one grayscale ramp.
         */
        ink: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        /**
         * `brand` is intentionally also grayscale: the identity has no accent
         * hue, so emphasis comes from contrast and weight rather than colour.
         * Keeping the scale means existing markup needs no rewrite to comply.
         */
        brand: {
          50: '#f5f5f5',
          100: '#e5e5e5',
          200: '#d4d4d4',
          300: '#a3a3a3',
          400: '#737373',
          500: '#404040',
          600: '#171717',
          700: '#0a0a0a',
          800: '#000000',
          900: '#000000',
        },
        /**
         * Champagne. The one warm note in an otherwise grayscale identity, used
         * only for hairlines, eyebrows and a few points of emphasis on the
         * marketing site - never as a fill for controls or large surfaces.
         */
        gold: {
          100: '#f3ecdf',
          200: '#e6d8bd',
          300: '#d7c19a',
          400: '#c5a878',
          500: '#ad8e5c',
          600: '#8a6f45',
        },
      },
      fontFamily: {
        sans: ['var(--font-studio-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
        display: ['var(--font-display)', 'ui-serif', 'Georgia', 'serif'],
        brand: ['var(--font-brand)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        // Tight, low-spread shadows: depth from edges rather than haze.
        panel: '0 1px 2px rgba(10,10,10,0.04), 0 8px 24px -14px rgba(10,10,10,0.10)',
        pop: '0 1px 2px rgba(10,10,10,0.05), 0 24px 60px -24px rgba(10,10,10,0.22)',
        lift: '0 1px 0 rgba(10,10,10,0.04), 0 12px 32px -16px rgba(10,10,10,0.16)',
        // Long, soft falloff for the few objects the marketing page elevates.
        luxe: '0 1px 1px rgba(10,10,10,0.04), 0 2px 6px -2px rgba(10,10,10,0.05), 0 40px 80px -40px rgba(10,10,10,0.28)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 160ms ease-out',
        'slide-up': 'slide-up 200ms cubic-bezier(0.16,1,0.3,1)',
      },
    },
  },
  plugins: [],
};

export default config;
