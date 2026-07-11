export const property = {
  name: "Campo Marzio 47",
  type: "Casa a schiera",
  address: {
    street: "Via Campo Marzio 47",
    zip: "36063",
    city: "Marostica",
    province: "VI",
    country: "Italia",
    full: "Via Campo Marzio 47, 36063 Marostica (VI), Italia",
  },
  host: {
    name: "Francesco",
    phone: "+39 348 367 2933",
    email: "campomarzio47.marostica@gmail.com",
    languages: ["Italiano", "Inglese", "Francese"],
  },
  facts: {
    surfaceSqm: 120,
    maxGuests: 4,
    bedrooms: 2,
    beds: 3,
    bathrooms: 2,
    renovatedYear: 2023,
    energyClass: "A+",
  },
  booking: {
    airbnbUrl: "https://www.airbnb.co.nz/rooms/1002183130178346620",
    bookingUrl:
      "https://www.booking.com/hotel/it/exclusive-house-in-marostica.it.html",
  },
  // Le recensioni restano nella lingua originale in cui sono state scritte
  // dagli ospiti (citazioni autentiche, non tradotte).
  reviews: [
    {
      name: "Nadir",
      group: "Famiglia",
      date: "Febbraio 2026",
      rating: 10,
      text: "Immobile bellissimo, con spazi congeniali e organizzati. La posizione è centralissima, il centro e le principali attrazioni della cittadina si raggiungono in pochi minuti. Host gentilissimi.",
    },
    {
      name: "Cristian",
      group: "Famiglia",
      date: "Gennaio 2025",
      rating: 10,
      text: "Molto vicino al centro di Marostica, in posizione tranquilla. La casa è accogliente e moderna, dotata di tutti i comfort. Siamo stati benissimo.",
    },
    {
      name: "Lucia",
      group: "Gruppo",
      date: "Dicembre 2024",
      rating: 10,
      text: "L'appartamento è molto accogliente, luminoso e ben arredato. La cura di ogni dettaglio è evidente. La posizione è centrale ma tranquilla. Speriamo di tornare presto.",
    },
  ],
  gallery: [
    { src: "/photos/soggiorno-tavolo.jpg" },
    { src: "/photos/soggiorno-divano.jpg" },
    { src: "/photos/camera-matrimoniale.jpg" },
    { src: "/photos/camera-letti-castello.jpg" },
    { src: "/photos/bagno.jpg" },
  ],
} as const;

export type Property = typeof property;
