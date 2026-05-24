/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    'from-slate-950', 'from-slate-900', 'from-slate-800',
    'from-sky-950', 'from-gray-950', 'from-gray-900',
    'via-slate-900', 'via-slate-800', 'via-indigo-950',
    'via-amber-900', 'via-sky-900', 'via-gray-800',
    'via-blue-950', 'via-blue-900', 'via-purple-950',
    'to-slate-900', 'to-slate-800', 'to-slate-950',
    'to-indigo-950', 'to-orange-950', 'to-gray-950',
    'to-gray-900', 'to-cyan-950',
  ],
  theme: {
    extend: {
      animation: {
        float: 'float 3s ease-in-out infinite',
        fadeInUp: 'fadeInUp 0.6s ease-out forwards',
        'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },
  plugins: [],
}
