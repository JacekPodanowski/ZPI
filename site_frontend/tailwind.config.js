// site_frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Skanuj wszystkie pliki JS/JSX/TS/TSX w katalogu src
    "./public/index.html",       // Jeśli używasz klas Tailwind bezpośrednio w index.html
  ],
  darkMode: 'class', // lub 'media', jeśli chcesz automatyczny tryb ciemny na podstawie ustawień systemu
  theme: {
    extend: {
      // Tutaj możesz rozszerzyć domyślną paletę kolorów Tailwind
      // lub zdefiniować całkowicie nową, nadpisując sekcję `colors` poza `extend`.
      // Poniżej przykład rozszerzenia:
      colors: {
        'brand-background': '#121212',    // Twoje tło
        'brand-surface': '#1e1e1e',       // Powierzchnie, karty
        'brand-primary': '#ff8c00',      // Twój pomarańczowy (DarkOrange)
        'brand-primary-hover': '#e67e00', // Ciemniejszy pomarańczowy
        'brand-secondary': '#9932cc',    // Twój fioletowy (DarkOrchid)
        'brand-secondary-hover': '#8728b3',// Ciemniejszy fioletowy
        'brand-accent-light': '#ffaf40',
        'brand-accent-dark': '#4B0082',   // Indygo dla głębi
        'brand-text-primary': '#e0e0e0',   // Główny tekst na ciemnym tle
        'brand-text-secondary': '#b0b0b0', // Drugorzędny tekst
        'brand-border': '#333333',
        'brand-link': 'var(--primary-color)', // Jeśli używasz zmiennych CSS
      },
      fontFamily: {
        // Jeśli chcesz dodać niestandardowe fonty do Tailwind
        // sans: ['"Twoja Główna Czcionka"', ...require('tailwindcss/defaultTheme').fontFamily.sans],
      },
      // Dodajemy animację, której używaliśmy w CSS
      animation: {
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [
    // Tutaj możesz dodać pluginy Tailwind, np.
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ],
}