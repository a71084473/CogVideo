/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pond: { top: '#6E97A6', mid: '#5A8C9D', deep: '#3F7F92', ink: '#163C47' },
        pool: '#8FE3F0',
        volt: '#FFF200',
        hot: '#FF3FA4',
      },
      fontFamily: {
        display: ['Fraunces', '"Young Serif"', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
