// defaults.js
export const NAVIGATION_DEFAULTS = {
  horizontal: {
    logo: {
      text: "Your Brand"
    },
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Calendar", href: "/calendar" },
      { label: "Contact", href: "/contact" }
    ],
    sticky: true
  },
  centered: {
    logo: {
      text: "Your Brand"
    },
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" }
    ],
    sticky: false
  },
  minimal: {
    links: [
      { label: "Home", href: "/" },
      { label: "Work", href: "/services" },
      { label: "Contact", href: "/contact" }
    ],
    sticky: true
  },
  mobile: {
    logo: {
      text: "Your Brand"
    },
    links: [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Services", href: "/services" },
      { label: "Contact", href: "/contact" }
    ],
    sticky: true
  }
};
