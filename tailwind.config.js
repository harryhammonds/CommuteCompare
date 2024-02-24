/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      display: ['Kosugi Maru', 'sans-serif'],
      mono: ['Courier Prime', 'monospace'],
    },
    screens: {
      sm: '640px',
      md: '844px', //custom
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
    extend: {},
  },
  plugins: [],
}
