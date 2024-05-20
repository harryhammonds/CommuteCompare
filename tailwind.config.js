/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    fontFamily: {
      display: ['Kosugi Maru', 'sans-serif'],
      mono: ['JetBrains Mono Variable', 'monospace'],
      sans: ['Inter Variable', 'sans-serif'],
      'mono-2': ['IBM Plex Mono', 'monospace'],
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
