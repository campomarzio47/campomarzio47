/** Tipo di viaggiatore, come lo classificano Airbnb e Booking. Le etichette tradotte sono in dictionaries.ts -> reviews.groups. */
export type TravellerGroup = "family" | "group" | "couple" | "solo" | "friends" | "business";

/** Una recensione citata dalle piattaforme (vedi `reviews` più sotto). */
export type Review = {
  name: string;
  group: TravellerGroup;
  /** Mese del soggiorno, "AAAA-MM": viene scritto per esteso nella lingua di chi legge. */
  date: string;
  /** Voto su 10, come lo riportano Airbnb e Booking. */
  rating: number;
  text: string;
  /** Lingua in cui è scritta, se non è l'italiano (es. "en", "de"). */
  lang?: string;
};

/** Una foto della galleria (vedi `gallery` più sotto). */
export type GalleryPhoto = {
  src: string;
  /** Dimensioni reali del file, in pixel. */
  width: number;
  height: number;
  /** Punto da tenere al centro se la foto viene tagliata (object-position). */
  focus?: string;
};

export const property = {
  name: "Campo Marzio 47",
  // Parte del nome da evidenziare in bordeaux nel logo (sidebar). Deve
  // comparire esattamente cosi' com'e' dentro "name". Lascia "" per non
  // evidenziare nulla.
  nameAccent: "47",
  type: "Casa a schiera",
  address: {
    street: "Via Campo Marzio 47",
    zip: "36063",
    city: "Marostica",
    province: "VI",
    // Nome per esteso della provincia, sopra il nome in copertina
    // ("Marostica · Vicenza").
    provinceName: "Vicenza",
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
  // Prezzi mostrati nella richiesta di prenotazione (/prenota) e nella
  // barra delle date in home: sono un preventivo, non un incasso. Importi
  // in euro interi (niente centesimi).
  // Prezzo unico per ora. Prezzi diversi per periodo/stagione sono
  // pianificati ma non ancora implementati: quando le date saranno
  // decise andrà aggiunta una logica di tariffe per intervallo di date
  // (non solo questo valore fisso).
  pricing: {
    currency: "EUR",
    pricePerNight: 140,
    cleaningFee: 0,
    minNights: 2,
    // Preavviso minimo in giorni prima dell'arrivo: oggi e i giorni
    // successivi fino a questo numero (oggi incluso) risultano sempre
    // "occupati" sul calendario e non prenotabili da /prenota, anche se il
    // feed iCal di Booking.com non lo segnala (non include il preavviso
    // minimo impostato lì, solo le prenotazioni vere e proprie).
    minAdvanceDays: 2,
  },
  // Le recensioni restano nella lingua originale in cui sono state scritte
  // dagli ospiti (citazioni autentiche, non tradotte).
  reviews: [
    {
      name: "Nadir",
      group: "family",
      date: "2026-02",
      rating: 10,
      text: "Immobile bellissimo, con spazi congeniali e organizzati. La posizione è centralissima, il centro e le principali attrazioni della cittadina si raggiungono in pochi minuti. Host gentilissimi.",
    },
    {
      name: "Cristian",
      group: "family",
      date: "2025-01",
      rating: 10,
      text: "Molto vicino al centro di Marostica, in posizione tranquilla. La casa è accogliente e moderna, dotata di tutti i comfort. Siamo stati benissimo.",
    },
    {
      name: "Lucia",
      group: "group",
      date: "2024-12",
      rating: 10,
      text: "L'appartamento è molto accogliente, luminoso e ben arredato. La cura di ogni dettaglio è evidente. La posizione è centrale ma tranquilla. Speriamo di tornare presto.",
    },
    // Il tipo esplicito serve a una struttura nuova senza recensioni:
    // `reviews: []` sotto `as const` diventerebbe di tipo `never` e la
    // build si fermerebbe. Con l'elenco vuoto la sezione non compare.
  ] as readonly Review[],
  // Foto grande in cima alla home page.
  heroImage: "/photos/copertina.jpg",
  // Tutte le foto della galleria, nell'ordine in cui si sfogliano.
  // Larghezza e altezza sono quelle reali del file: servono a mostrare
  // ogni foto nel suo formato (verticale o orizzontale) e a non ingrandirla
  // oltre la sua risoluzione, che con le foto da telefono si vede subito.
  // In home compaiono le prime quattro, scelte per orientamento (vedi
  // components/PhotoMosaic.tsx): metti in testa le più belle. `focus`
  // (facoltativo, come object-position) dice dove tagliare una foto
  // orizzontale quando finisce in un posto verticale della composizione:
  // va bene per un dettaglio, non per una stanza intera.
  // Alt e didascalie sono in dictionaries.ts -> photos.items, nello stesso
  // ordine.
  gallery: [
    { src: "/photos/zona-pranzo.jpg", width: 2000, height: 1333 },
    { src: "/photos/camera-matrimoniale.jpg", width: 512, height: 683 },
    { src: "/photos/angolo-caffe.jpg", width: 2000, height: 1333, focus: "78% 50%" },
    { src: "/photos/cucina-balcone.jpg", width: 2000, height: 1333 },
    { src: "/photos/soggiorno-tavolo.jpg", width: 911, height: 683 },
    { src: "/photos/soggiorno-divano.jpg", width: 911, height: 683 },
    { src: "/photos/cucina.jpg", width: 911, height: 683 },
    { src: "/photos/camera-letti-castello.jpg", width: 911, height: 683 },
    { src: "/photos/bagno.jpg", width: 2000, height: 1333 },
    { src: "/photos/facciata.jpg", width: 2000, height: 1333 },
  ] as readonly GalleryPhoto[],
  // Sezione "dove siamo" della home: una foto del luogo (vista, paese,
  // dintorni) con i testi di dictionaries.ts -> place. Orizzontale va a
  // tutta larghezza sopra il testo, verticale gli sta accanto. Con `photo`
  // vuoto la sezione mostra solo il testo; con `place.title` vuoto nel
  // dizionario non compare affatto.
  surroundings: {
    photo: { src: "/photos/partita-scacchi.jpg", width: 1500, height: 1125 },
    // Link "Apri in Mappe": un semplice link, nessuna mappa incorporata
    // (niente cookie di terze parti, vedi la cookie policy).
    mapsQuery: "Via Campo Marzio 47, 36063 Marostica VI",
  },
} as const;

export type Property = typeof property;
