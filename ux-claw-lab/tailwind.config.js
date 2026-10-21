/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF9F0',
        sakura: '#FFA9C5',
        mint: '#B7E8D0',
        sky: '#A9D9F8',
        butter: '#FFE49A',
        ink: '#35465C',
        dusk: '#6B5BB8',
      },
      fontFamily: {
        display: ['"Baloo 2"', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(53,70,92,0.35)',
        toy: 'inset 0 -6px 0 rgba(0,0,0,0.12), 0 6px 14px -6px rgba(53,70,92,0.45)',
      },
    },
  },
  plugins: [],
};
