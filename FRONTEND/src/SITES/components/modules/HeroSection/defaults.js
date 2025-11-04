// defaults.js - Use random image seeds
const randomSeed = () => Math.random().toString(36).substring(7);

export const HERO_DEFAULTS = {
  centered: {
    heading: "Welcome to Our Space",
    subheading: "Your journey starts here",
    ctaText: "Get Started",
    ctaLink: "/"
  },
  split: {
    heading: "Transform Your Experience",
    subheading: "Discover what makes us different",
    image: `https://picsum.photos/seed/${randomSeed()}/800/600`,
    imagePosition: 'right',
    ctaText: "Learn More",
    ctaLink: "/about"
  },
  fullscreen: {
    heading: "Elevate Your Journey",
    subheading: "Where vision meets reality",
    backgroundImage: `https://picsum.photos/seed/${randomSeed()}/1920/1080`,
    overlay: true,
    ctaText: "Explore",
    ctaLink: "/services"
  }
};
