/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Vazirmatn', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        pitch: {
          darkest: '#041308',
          dark: '#082310',
          base: '#0c3317',
          light: '#144d24',
          accent: '#22c55e',
          neon: '#4ade80',
        },
        glass: {
          surface: 'rgba(12, 38, 20, 0.65)',
          border: 'rgba(255, 255, 255, 0.12)',
          highlight: 'rgba(255, 255, 255, 0.22)',
          glow: 'rgba(74, 222, 128, 0.25)',
        }
      },
      backdropBlur: {
        '2xl': '24px',
        '3xl': '36px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(74, 222, 128, 0.3)' },
          '100%': { boxShadow: '0 0 25px rgba(74, 222, 128, 0.7)' },
        }
      }
    },
  },
  plugins: [],
}
