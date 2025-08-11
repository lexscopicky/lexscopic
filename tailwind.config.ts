// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#e8efff',
          100: '#cfe0ff',
          200: '#a8c4ff',
          300: '#7fa7ff',
          400: '#5588ff',
          500: '#2f6bff',
          600: '#0033a0',
          700: '#002a86',
          800: '#001f63',
          900: '#0b1b4b'
        },
        ink: '#0f172a'
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem'
      }
    },
  },
  plugins: [],
}

export default config
