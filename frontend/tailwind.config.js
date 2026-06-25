/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'jalaspe-blue': '#003050',
        'jalaspe-lime': '#CADD09',
        'jalaspe-turquoise': '#00A5B6',
        'jalaspe-grey': '#6C6F70'
      },
      fontFamily: {
        // Le decimos a Tailwind que 'sans' ahora usa Poppins
        sans: ['Poppins', 'sans-serif'],
      }
    },
  },
  plugins: [],
}