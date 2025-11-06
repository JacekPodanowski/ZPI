// defaults.js
const randomSeed = () => Math.random().toString(36).substring(7);

export const SERVICES_DEFAULTS = {
  cards: {
    title: "Our Services",
    subtitle: "Discover what we offer",
    items: [
      {
        name: "Individual Sessions",
        description: "Personalized one-on-one guidance tailored to your unique needs",
        image: `https://picsum.photos/seed/${randomSeed()}/400/300`,
        icon: "👤"
      },
      {
        name: "Group Workshops",
        description: "Collaborative learning experiences in a supportive environment",
        image: `https://picsum.photos/seed/${randomSeed()}/400/300`,
        icon: "👥"
      },
      {
        name: "Online Programs",
        description: "Flexible digital courses accessible from anywhere",
        image: `https://picsum.photos/seed/${randomSeed()}/400/300`,
        icon: "💻"
      }
    ]
  },
  list: {
    title: "What We Offer",
    subtitle: "Comprehensive services for your journey",
    items: [
      {
        name: "Initial Consultation",
        description: "A thorough assessment to understand your goals and create a personalized plan",
        icon: "🎯"
      },
      {
        name: "Regular Sessions",
        description: "Ongoing support and guidance through structured sessions",
        icon: "📅"
      },
      {
        name: "Resource Library",
        description: "Access to curated materials and tools for continued growth",
        icon: "📚"
      },
      {
        name: "Community Support",
        description: "Connection with others on similar journeys",
        icon: "🤝"
      }
    ]
  },
  accordion: {
    title: "Service Packages",
    subtitle: "Choose the option that fits you best",
    items: [
      {
        name: "Starter Package",
        description: "Perfect for those beginning their journey",
        details: "Includes 4 individual sessions, email support, and access to our resource library. Ideal for establishing foundations and exploring initial goals."
      },
      {
        name: "Growth Package",
        description: "For those ready to dive deeper",
        details: "Includes 8 individual sessions, priority email support, 2 group workshops, and full resource library access. Best for committed personal development."
      },
      {
        name: "Transformation Package",
        description: "Comprehensive support for lasting change",
        details: "Includes 12 individual sessions, unlimited email support, 4 group workshops, personalized resources, and quarterly progress reviews. Our most complete offering."
      }
    ]
  }
};
