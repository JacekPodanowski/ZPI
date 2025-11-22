// defaults.js - Rich mock data variants for Hero module

export const HERO_DEFAULTS = {
  centered: [
    {
      title: "Odkryj Swoją Wewnętrzną Równowagę",
      subtitle: "Profesjonalne sesje jogi i medytacji w sercu miasta",
      ctaText: "Zarezerwuj Sesję",
      ctaLink: "/rezerwacja",
      showButton: true,
      image: `https://picsum.photos/seed/hero-centered-1/1920/1080`
    },
    {
      title: "Rozwijaj Swój Biznes z Ekspertem",
      subtitle: "Indywidualne konsultacje biznesowe dla przedsiębiorców",
      ctaText: "Umów Konsultację",
      ctaLink: "/kontakt",
      showButton: true,
      image: `https://picsum.photos/seed/hero-centered-2/1920/1080`
    },
    {
      title: "Twoja Wizja, Moja Pasja",
      subtitle: "Profesjonalna fotografia portretowa i eventowa",
      ctaText: "Zobacz Portfolio",
      ctaLink: "/galeria",
      showButton: true,
      image: `https://picsum.photos/seed/hero-centered-3/1920/1080`
    }
  ],
  split: [
    {
      title: "Odkryj Sztukę Spokoju",
      subtitle: "Twoja osobista przestrzeń do praktyki jogi i medytacji",
      image: `https://picsum.photos/seed/hero-split-1/800/600`,
      imagePosition: 'right',
      ctaText: "Zobacz Ofertę",
      ctaLink: "/oferta",
      showButton: true
    },
    {
      title: "Przekształć Swoją Karierę",
      subtitle: "Kompleksowe wsparcie w rozwoju zawodowym i osobistym",
      image: `https://picsum.photos/seed/hero-split-2/800/600`,
      imagePosition: 'left',
      ctaText: "Poznaj Metody",
      ctaLink: "/uslugi",
      showButton: true
    },
    {
      title: "Uwiecznij Najważniejsze Chwile",
      subtitle: "Artystyczna fotografia z pasją i profesjonalizmem",
      image: `https://picsum.photos/seed/hero-split-3/800/600`,
      imagePosition: 'right',
      ctaText: "Sprawdź Cennik",
      ctaLink: "/cennik",
      showButton: true
    }
  ],
  fullscreen: [
    {
      title: "Przestrzeń dla Twojego Ciała i Umysłu",
      subtitle: "Dołącz do naszej społeczności świadomych praktyków",
      image: `https://picsum.photos/seed/hero-full-1/1920/1080`,
      overlay: true,
      ctaText: "Rozpocznij Praktykę",
      ctaLink: "/start",
      showButton: true
    },
    {
      title: "Zbuduj Silny Fundament Biznesowy",
      subtitle: "Strategia, coaching i mentoring dla liderów",
      image: `https://picsum.photos/seed/hero-full-2/1920/1080`,
      overlay: true,
      ctaText: "Dowiedz Się Więcej",
      ctaLink: "/o-mnie",
      showButton: true
    },
    {
      title: "Twórz Niezapomniane Historie",
      subtitle: "Profesjonalne sesje zdjęciowe w wyjątkowych lokalizacjach",
      image: `https://picsum.photos/seed/hero-full-3/1920/1080`,
      overlay: true,
      ctaText: "Zarezerwuj Sesję",
      ctaLink: "/rezerwacja",
      showButton: true
    }
  ]
};
