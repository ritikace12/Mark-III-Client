/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF0000',
          dark: '#CC0000',
        },
        secondary: {
          DEFAULT: '#FFD700',
          dark: '#CCAC00',
        },
      },
    },
  },
  plugins: [],
} 