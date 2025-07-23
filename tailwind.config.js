/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        babyBlue: '#89CFF0',
        blueGrotto: '#0066b2',
        royalBlue: '#002D62',
        navyBlue: '#00539C',
      },
    },
  },
  plugins: [],
}