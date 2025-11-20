// defaults.js - Rich mock data variants for Gallery module

// Helper function for generating random seeds for Picsum
export const GALLERY_DEFAULTS = {
  grid: [
    {
      images: [
        { url: `https://picsum.photos/seed/gallery-grid-1/800/600`, caption: "Poranna praktyka Hatha Yoga" },
        { url: `https://picsum.photos/seed/gallery-grid-2/800/600`, caption: "Medytacja w naszym studio" },
        { url: `https://picsum.photos/seed/gallery-grid-3/800/600`, caption: "Zajęcia grupowe Vinyasa Flow" },
        { url: `https://picsum.photos/seed/gallery-grid-4/800/600`, caption: "Wieczorna praktyka outdoorowa" }
      ],
      columns: 3,
      gap: '1rem'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/gallery-coach-1/800/600`, caption: "Sesja coachingowa 1:1" },
        { url: `https://picsum.photos/seed/gallery-coach-2/800/600`, caption: "Przestrzeń do pracy" },
        { url: `https://picsum.photos/seed/gallery-coach-3/800/600`, caption: "Warsztat dla liderów" },
        { url: `https://picsum.photos/seed/gallery-coach-4/800/600`, caption: "Realizacja celów klientów" }
      ],
      columns: 3,
      gap: '1rem'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/gallery-photo-1/800/600`, caption: "Sesja portretowa - naturalne światło" },
        { url: `https://picsum.photos/seed/gallery-photo-2/800/600`, caption: "Fotografia ślubna" },
        { url: `https://picsum.photos/seed/gallery-photo-3/800/600`, caption: "Rodzinna sesja plenerowa" },
        { url: `https://picsum.photos/seed/gallery-photo-4/800/600`, caption: "Sesja modowa w studio" }
      ],
      columns: 3,
      gap: '1rem'
    }
  ],
  masonry: [
    {
      images: [
        { url: `https://picsum.photos/seed/masonry-yoga-1/600/800`, caption: "Pozycja równowagi" },
        { url: `https://picsum.photos/seed/masonry-yoga-2/800/600`, caption: "Medytacja w naturze" },
        { url: `https://picsum.photos/seed/masonry-yoga-3/600/900`, caption: "Trening elastyczności" },
        { url: `https://picsum.photos/seed/masonry-yoga-4/700/500`, caption: "Strefa relaksu" },
        { url: `https://picsum.photos/seed/masonry-yoga-5/800/800`, caption: "Chwila uważności" }
      ],
      columns: 3,
      gap: '1rem'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/masonry-biz-1/600/800`, caption: "Osiąganie celów" },
        { url: `https://picsum.photos/seed/masonry-biz-2/800/600`, caption: "Planowanie strategiczne" },
        { url: `https://picsum.photos/seed/masonry-biz-3/600/900`, caption: "Budowanie zespołu" },
        { url: `https://picsum.photos/seed/masonry-biz-4/700/500`, caption: "Rozwój kompetencji" },
        { url: `https://picsum.photos/seed/masonry-biz-5/800/800`, caption: "Innowacyjne podejście" }
      ],
      columns: 3,
      gap: '1rem'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/masonry-art-1/600/800`, caption: "Piękno w prostocie" },
        { url: `https://picsum.photos/seed/masonry-art-2/800/600`, caption: "Uczucie uchwycone" },
        { url: `https://picsum.photos/seed/masonry-art-3/600/900`, caption: "Elegancja i styl" },
        { url: `https://picsum.photos/seed/masonry-art-4/700/500`, caption: "Rodzinne wspomnienia" },
        { url: `https://picsum.photos/seed/masonry-art-5/800/800`, caption: "Czarno-biała magia" }
      ],
      columns: 3,
      gap: '1rem'
    }
  ],
  slideshow: [
    {
      images: [
        { url: `https://picsum.photos/seed/slide-yoga-1/1200/800`, caption: "Spokój i harmonia" },
        { url: `https://picsum.photos/seed/slide-yoga-2/1200/800`, caption: "Medytacja w górach" },
        { url: `https://picsum.photos/seed/slide-yoga-3/1200/800`, caption: "Praktyka nad morzem" },
        { url: `https://picsum.photos/seed/slide-yoga-4/1200/800`, caption: "Jedność z naturą" }
      ],
      columns: 1,
      gap: '0'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/slide-biz-1/1200/800`, caption: "Biznes na najwyższym poziomie" },
        { url: `https://picsum.photos/seed/slide-biz-2/1200/800`, caption: "Droga do sukcesu" },
        { url: `https://picsum.photos/seed/slide-biz-3/1200/800`, caption: "Wizja lidera" },
        { url: `https://picsum.photos/seed/slide-biz-4/1200/800`, caption: "Transformacja biznesowa" }
      ],
      columns: 1,
      gap: '0'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/slide-photo-1/1200/800`, caption: "Dramatyczny portret" },
        { url: `https://picsum.photos/seed/slide-photo-2/1200/800`, caption: "Najważniejszy dzień" },
        { url: `https://picsum.photos/seed/slide-photo-3/1200/800`, caption: "Moda i elegancja" },
        { url: `https://picsum.photos/seed/slide-photo-4/1200/800`, caption: "Sztuka fotografii" }
      ],
      columns: 1,
      gap: '0'
    }
  ],
  carousel: [
    {
      images: [
        { url: `https://picsum.photos/seed/carousel-yoga-1/900/600`, caption: "Zajęcia dla wszystkich poziomów" },
        { url: `https://picsum.photos/seed/carousel-yoga-2/900/600`, caption: "Grupowa medytacja" },
        { url: `https://picsum.photos/seed/carousel-yoga-3/900/600`, caption: "Specjalne warsztaty" },
        { url: `https://picsum.photos/seed/carousel-yoga-4/900/600`, caption: "Weekendowe retreaty" },
        { url: `https://picsum.photos/seed/carousel-yoga-5/900/600`, caption: "Nasza społeczność" }
      ],
      columns: 1,
      gap: '1rem'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/carousel-biz-1/900/600`, caption: "Konferencje biznesowe" },
        { url: `https://picsum.photos/seed/carousel-biz-2/900/600`, caption: "Szkolenia dla firm" },
        { url: `https://picsum.photos/seed/carousel-biz-3/900/600`, caption: "Sesje indywidualne" },
        { url: `https://picsum.photos/seed/carousel-biz-4/900/600`, caption: "Praca zespołowa" },
        { url: `https://picsum.photos/seed/carousel-biz-5/900/600`, caption: "Świętowanie sukcesów" }
      ],
      columns: 1,
      gap: '1rem'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/carousel-photo-1/900/600`, caption: "Sesje studyjne" },
        { url: `https://picsum.photos/seed/carousel-photo-2/900/600`, caption: "Pary młode" },
        { url: `https://picsum.photos/seed/carousel-photo-3/900/600`, caption: "Portrety rodzinne" },
        { url: `https://picsum.photos/seed/carousel-photo-4/900/600`, caption: "Sesje edytorskie" },
        { url: `https://picsum.photos/seed/carousel-photo-5/900/600`, caption: "Wydarzenia specjalne" }
      ],
      columns: 1,
      gap: '1rem'
    }
  ],
  fade: [
    {
      images: [
        { url: `https://picsum.photos/seed/fade-yoga-1/1400/900`, caption: "Cisza i spokój" },
        { url: `https://picsum.photos/seed/fade-yoga-2/1400/900`, caption: "Stan zen" },
        { url: `https://picsum.photos/seed/fade-yoga-3/1400/900`, caption: "Perfekcyjna równowaga" },
        { url: `https://picsum.photos/seed/fade-yoga-4/1400/900`, caption: "Harmonia ciała i umysłu" }
      ],
      columns: 1,
      gap: '0'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/fade-biz-1/1400/900`, caption: "Doskonałość w biznesie" },
        { url: `https://picsum.photos/seed/fade-biz-2/1400/900`, caption: "Siła przywództwa" },
        { url: `https://picsum.photos/seed/fade-biz-3/1400/900`, caption: "Smak zwycięstwa" },
        { url: `https://picsum.photos/seed/fade-biz-4/1400/900`, caption: "Mądrość doświadczenia" }
      ],
      columns: 1,
      gap: '0'
    },
    {
      images: [
        { url: `https://picsum.photos/seed/fade-photo-1/1400/900`, caption: "Arcydzieło portretu" },
        { url: `https://picsum.photos/seed/fade-photo-2/1400/900`, caption: "Magia ślubu" },
        { url: `https://picsum.photos/seed/fade-photo-3/1400/900`, caption: "Ponadczasowa sztuka" },
        { url: `https://picsum.photos/seed/fade-photo-4/1400/900`, caption: "Luksus i styl" }
      ],
      columns: 1,
      gap: '0'
    }
  ]
};

