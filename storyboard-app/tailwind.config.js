/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1a1a1a',
        paper: '#fafaf8',
        /** 裝飾性分隔線（非 UI 元件邊界，不受 1.4.11 規範） */
        line: '#c9c9c4',
        /** 表單控制項邊界：對 paper 達 3.32:1，符合 WCAG 1.4.11 非文字對比 */
        field: '#8a8a85',
        /** 次要文字：對 paper 達 4.83:1，符合 WCAG 1.4.3 AA */
        faint: '#6f6f6a',
      },
      fontFamily: {
        serif: ['"Noto Serif TC"', 'Georgia', '"Songti TC"', 'serif'],
        sans: ['"Noto Sans TC"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      letterSpacing: {
        widest2: '0.35em',
      },
      keyframes: {
        breathe: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.15)', opacity: '0.6' },
        },
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        breathe: 'breathe 1.6s ease-in-out infinite',
        fadeUp: 'fadeUp 0.6s ease-out both',
      },
    },
  },
  plugins: [],
}
