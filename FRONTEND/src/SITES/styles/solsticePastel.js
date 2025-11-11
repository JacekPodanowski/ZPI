// solsticePastel.js
// Pastelowa paleta z miękkimi gradientami i organicznymi kształtami.

export default {
  id: 'solsticePastel',
  name: 'Solstice Pastel',
  description: 'Pastelowa paleta z miękkimi gradientami i organicznymi kształtami.',
  previewImage: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=2000&q=70',
  backgroundColor: '#f9f5ff',
  backgroundTexture: 'url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=70)',
  overlayGradient: 'linear-gradient(180deg, rgba(249,245,255,0.45) 0%, rgba(249,245,255,0.96) 100%)',
  accentColor: '#8a7aea',
  titleFont: '"Poppins", "Helvetica", sans-serif',
  spacing: 'space-y-8 md:space-y-10 py-16 md:py-20 px-4 md:px-6',
  borders: 'border-0',
  shadows: 'shadow-none',
  rounded: 'rounded-2xl md:rounded-3xl',
  animations: 'transition-all duration-400 ease-in-out',
  textSize: 'text-sm md:text-base leading-loose',
  headingSize: 'text-2xl md:text-3xl lg:text-4xl font-medium tracking-wide',
  buttonStyle: 'px-5 md:px-6 py-2 rounded-full font-normal text-xs md:text-sm',
  cardStyle: 'rounded-2xl md:rounded-3xl p-5 md:p-7 bg-gradient-to-br hover:scale-105',
  light: {
    background: '#f2eef9',
    text: '#211c2c',
    primary: '#7a5cc2',
    secondary: '#d9c7eb'
  }
};
