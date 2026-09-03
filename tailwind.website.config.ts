import type { Config } from 'tailwindcss';

/**
 * Tailwind config for the compiled *website* stylesheet.
 *
 * Scans only the renderer, so the exported CSS stays small and contains
 * nothing from the studio UI.
 */
const config: Config = {
  content: ['./src/components/website/**/*.{ts,tsx}'],
  theme: {
    extend: {
      // Utilities that need to resolve to theme variables at runtime.
      borderRadius: {
        DEFAULT: 'var(--ws-radius)',
        sm: 'var(--ws-radius-sm)',
        lg: 'var(--ws-radius-lg)',
        full: '9999px',
      },
    },
  },
  corePlugins: {
    // The renderer never uses Tailwind colour utilities - colour comes from
    // CSS variables - so dropping the palette keeps the bundle tiny.
    preflight: true,
  },
  plugins: [],
};

export default config;
