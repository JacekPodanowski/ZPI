// defaults.js - Rich mock data variants for Contact module
export const CONTACT_DEFAULTS = {
  form: [
    {
      title: "Skontaktuj Się z Nami",
      description: "Masz pytania o zajęcia lub chcesz zarezerwować sesję? Napisz do nas, odpowiemy w ciągu 24 godzin.",
      showForm: true,
      formFields: ['name', 'email', 'message']
    },
    {
      title: "Umów Konsultację",
      description: "Rozpocznij swoją podróż rozwoju. Wypełnij formularz, a skontaktujemy się z Tobą w ciągu jednego dnia roboczego.",
      showForm: true,
      formFields: ['name', 'email', 'message']
    },
    {
      title: "Zarezerwuj Sesję",
      description: "Chcesz umówić sesję zdjęciową? Opisz swoją wizję, a my przygotujemy dla Ciebie wyjątkową ofertę.",
      showForm: true,
      formFields: ['name', 'email', 'message']
    }
  ],
  info: [
    {
      title: "Informacje Kontaktowe",
      description: "Znajdź nas w centrum miasta lub skontaktuj się online",
      email: "kontakt@pracowniajoги.pl",
      phone: "+48 123 456 789",
      address: "ul. Spokojna 15, 00-001 Warszawa"
    },
    {
      title: "Skontaktuj Się",
      description: "Jesteśmy dostępni od poniedziałku do piątku, 9:00-18:00",
      email: "coaching@biznescoach.pl",
      phone: "+48 987 654 321",
      address: "Al. Jerozolimskie 123/45, 00-001 Warszawa"
    },
    {
      title: "Gdzie Nas Znajdziesz",
      description: "Studio fotograficzne w sercu miasta",
      email: "studio@fotografia.pl",
      phone: "+48 555 123 456",
      address: "ul. Artystyczna 8, 00-001 Kraków"
    }
  ],
  split: [
    {
      title: "Rozpocznij Praktykę",
      description: "Masz pytania o zajęcia, warsztaty lub członkostwo? Skontaktuj się z nami!",
      email: "info@jogastudio.pl",
      phone: "+48 123 456 789",
      showForm: true,
      formFields: ['name', 'email', 'phone', 'message']
    },
    {
      title: "Porozmawiajmy",
      description: "Chcesz dowiedzieć się więcej o coachingu lub umówić pierwszą sesję? Jesteśmy tu dla Ciebie.",
      email: "biuro@rozwojbiznesu.pl",
      phone: "+48 987 654 321",
      showForm: true,
      formFields: ['name', 'email', 'phone', 'message']
    },
    {
      title: "Umów Sesję Zdjęciową",
      description: "Opowiedz nam o swoich potrzebach, a my przygotujemy idealną sesję.",
      email: "rezerwacje@fotostudio.pl",
      phone: "+48 555 123 456",
      showForm: true,
      formFields: ['name', 'email', 'phone', 'message']
    }
  ]
};
