import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#10233a',
          hover: '#0c1b2d',
          muted: '#3d5270',
        },
        background: '#eef1f5',
        foreground: '#10233a',
        surface: '#ffffff',
        muted: '#3f4f63',
        subtle: '#5b6b80',
        line: '#c5ced8',
        danger: '#b42318',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      maxWidth: {
        board: '72rem',
      },
    },
  },
  plugins: [],
};

export default config;
