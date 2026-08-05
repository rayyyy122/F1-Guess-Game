/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '"Titillium Web"',
          'system-ui',
          '-apple-system',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        f1: {
          red: '#E10600',
          dark: '#15151E',
          green: '#38D1A8',
          yellow: '#FAB500',
          blue: '#006F62',
          gray: '#38383F',
          text: '#F1F1F1',
        },
      },
    },
  },
  plugins: [],
}
