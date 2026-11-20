import type { Config } from 'tailwindcss';
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#080909', 2: '#111313', 3: '#171a19' },
        paper: '#F3F3EF',
        mute: '#858985',
        line: '#292D2B',
        jade: { DEFAULT: '#72D6A1', dim: '#2f5a44' },
        alert: '#E06C5B',
        amber: '#D8B26A',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      },
      letterSpacing: { tightest: '-0.045em' },
      maxWidth: { page: '1360px' },
    },
  },
  plugins: [],
} satisfies Config;
