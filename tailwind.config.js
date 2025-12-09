/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F37021', // The signature orange
          hover: '#d65a12',
        },
        dark: {
          DEFAULT: '#111111',
          lighter: '#1a1a1a',
          footer: '#1B2028', // Dark blueish tone for footer
        },
        gray: {
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          500: '#737373',
          800: '#262626',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'], // Clean sans-serif similar to reference
      },
      container: {
        center: true,
        padding: '1rem',
        screens: {
          '2xl': '1280px', // Limit max width to match the portal look
        }
      }
    },
  },
  plugins: [
    typography,
  ],
}
