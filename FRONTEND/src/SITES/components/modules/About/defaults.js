// defaults.js
const randomSeed = () => Math.random().toString(36).substring(7);

export const ABOUT_DEFAULTS = {
  timeline: {
    title: "Our Journey",
    description: "A story of growth, passion, and continuous evolution",
    milestones: [
      { year: "2019", title: "The Beginning", desc: "Started with a vision to make a difference" },
      { year: "2021", title: "Expansion", desc: "Grew our team and broadened our reach" },
      { year: "2023", title: "Innovation", desc: "Launched new services and approaches" },
      { year: "2025", title: "Today", desc: "Continuing to evolve and serve our community" }
    ]
  },
  grid: {
    title: "About Us",
    description: "We are dedicated to creating meaningful experiences that transform lives. Our approach combines expertise with genuine care for every individual we work with.",
    image: `https://picsum.photos/seed/${randomSeed()}/600/400`,
    highlights: [
      { title: "Experience", desc: "Over 10 years in the field" },
      { title: "Dedication", desc: "Committed to your success" },
      { title: "Innovation", desc: "Always evolving our methods" },
      { title: "Community", desc: "Building lasting connections" }
    ]
  },
  narrative: {
    title: "My Story",
    description: "Every journey begins with a single step. Mine started years ago with a passion for helping others discover their potential. Through continuous learning and genuine connections, I've developed an approach that honors each person's unique path while providing the guidance needed for transformation.",
    image: `https://picsum.photos/seed/${randomSeed()}/600/400`
  }
};
