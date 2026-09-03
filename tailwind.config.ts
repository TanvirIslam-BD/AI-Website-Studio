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
        ink: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5d9e2',
          300: '#b0b8c9',
          400: '#8591aa',
          500: '#66738f',
          600: '#515c76',
          700: '#434b60',
          800: '#3a4051',
          900: '#181b23',
          950: '#0d0f14',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
      },
      fontFamily: {
        sans: ['var(--font-studio-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
        brand: ['var(--font-brand)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        panel: '0 1px 2px rgba(13,15,20,0.04), 0 8px 24px -12px rgba(13,15,20,0.12)',
        pop: '0 12px 40px -8px rgba(13,15,20,0.22)',
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
