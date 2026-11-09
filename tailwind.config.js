/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        marian: {
          DEFAULT: '#1E3A8A',
          light: '#3B82F6',
        },
        liturgical: {
          DEFAULT: '#D97706',
        },
        surface: {
          DEFAULT: '#0f172a',
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', 'Segoe UI', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      borderRadius: {
        xl: '0.75rem',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        adaltare: {
          primary: '#fbbf24',
          secondary: '#34d399',
          accent: '#fbbf24',
          neutral: '#1e293b',
          'base-100': '#0f172a',
          'base-200': '#1e293b',
          'base-300': '#334155',
          info: '#38bdf8',
          success: '#34d399',
          warning: '#fbbf24',
          error: '#f87171',
        },
      },
    ],
  },
}
