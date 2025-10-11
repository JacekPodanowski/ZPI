/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(146, 0, 32)',
        'primary-dark': 'rgb(114, 0, 21)',
        background: 'rgb(228, 229, 218)',
        'background-dark': 'rgb(12, 12, 12)',
        text: 'rgb(30, 30, 30)',
        'text-dark': 'rgb(220, 220, 220)',
      },
      borderRadius: {
        'xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
