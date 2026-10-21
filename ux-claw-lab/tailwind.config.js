/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#FFF4E0',
        sakura: '#E9A29B',
        mint: '#BFDDA0',
        sky: '#F3D3A8',
        butter: '#FFCE55',
        ink: '#3E2A1F',
        dusk: '#B5676B',
        potato: '#F7BF45',
      },
      fontFamily: {
        display: ['"Baloo 2"', 'Huninn', '"Noto Sans TC"', 'system-ui', 'sans-serif'],
        body: ['"Noto Sans TC"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 8px 24px -8px rgba(62,42,31,0.35)',
        toy: 'inset 0 -6px 0 rgba(0,0,0,0.12), 0 6px 14px -6px rgba(62,42,31,0.45)',
      },
    },
  },
  plugins: [],
};
