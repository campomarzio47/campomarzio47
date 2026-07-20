import type { DocumentTypeCode, TipoTurismo, MezzoTrasporto } from "@/lib/checkin-types";

export type Dictionary = {
  meta: { title: string; description: string };
  languageSwitcher: { label: string };
  nav: {
    home: string;
    photos: string;
    amenities: string;
    reviews: string;
    availability: string;
    contact: string;
    checkin: string;
  };
  hero: {
    tagline: string;
    description: string;
    facts: { surface: string; bedrooms: string; guests: string; garden: string };
  };
  buttons: { airbnb: string; booking: string };
  home: {
    photos: { title: string; description: string };
    amenities: { title: string; description: string };
    availability: { title: string; description: string };
  };
  photos: {
    title: string;
    subtitle: string;
    close: string;
    prev: string;
    next: string;
    items: { alt: string; caption: string }[];
  };
  amenities: {
    title: string;
    subtitle: string;
    items: { icon: string; category: string; title: string; description: string }[];
  };
  reviews: {
    title: string;
    subtitle: string;
    allOnAirbnb: string;
    allOnBooking: string;
  };
  availability: {
    title: string;
    subtitle: string;
    loading: string;
    unconfigured: string;
    error: string;
    checkPlatforms: string;
    legendUnavailable: string;
    rulesTitle: string;
    rules: { label: string; value: string }[];
  };
  bookingRequest: {
    title: string;
    description: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    checkinLabel: string;
    checkoutLabel: string;
    guestsLabel: string;
    messagePlaceholder: string;
    overlapWarning: string;
    submit: string;
    sending: string;
    sentTitle: string;
    sentBody: string;
    errorPrefix: string;
    errorFallbackLink: string;
  };
  contact: {
    title: string;
    subtitle: string;
    languages: string[];
    namePlaceholder: string;
    emailPlaceholder: string;
    arrivalLabel: string;
    departureLabel: string;
    messagePlaceholder: string;
    send: string;
    sending: string;
    sent: string;
    errorPrefix: string;
    errorFallbackLink: string;
  };
  checkin: {
    title: string;
    subtitle: string;
    arrivalDate: string;
    nights: string;
    guest: string;
    removeGuest: string;
    lastName: string;
    firstName: string;
    sex: string;
    male: string;
    female: string;
    birthDate: string;
    email: string;
    emailPlaceholder: string;
    citizenship: string;
    citizenshipPlaceholder: string;
    residenceState: string;
    residenceStatePlaceholder: string;
    residencePlace: string;
    residencePlacePlaceholder: string;
    residenceAbroadPlace: string;
    residenceAbroadPlacePlaceholder: string;
    residenceAddress: string;
    residenceAddressPlaceholder: string;
    birthState: string;
    birthStatePlaceholder: string;
    birthPlace: string;
    birthPlacePlaceholder: string;
    fiscalCode: string;
    fiscalCodePlaceholder: string;
    fiscalCodeInvalid: string;
    documentType: string;
    documentTypes: { code: DocumentTypeCode; label: string }[];
    documentNumber: string;
    issueState: string;
    issueStatePlaceholder: string;
    issuePlace: string;
    issuePlacePlaceholder: string;
    tourismType: string;
    tourismTypeOptions: { code: TipoTurismo; label: string }[];
    transportMeans: string;
    transportMeansOptions: { code: MezzoTrasporto; label: string }[];
    addGuest: string;
    consent: string;
    submit: string;
    sending: string;
    sentTitle: string;
    sentBody: string;
    errorGeneric: string;
    errorIncompletePlace: string;
  };
};

export const it: Dictionary = {
  meta: {
    title: "Campo Marzio 47 — Casa a schiera moderna nel cuore di Marostica",
    description:
      "Casa a schiera moderna a Marostica, 120 m², fino a 4 ospiti. Prenota su Airbnb o Booking.com e completa il check-in online.",
  },
  languageSwitcher: { label: "Lingua" },
  nav: {
    home: "La Casa",
    photos: "Foto",
    amenities: "Servizi",
    reviews: "Recensioni",
    availability: "Disponibilità",
    contact: "Contatti",
    checkin: "Check-in online",
  },
  hero: {
    tagline: "Casa a schiera moderna nel cuore di Marostica",
    description: `La casa, completamente ristrutturata nel 2023 con la massima certificazione energetica, è perfetta per famiglie, coppie, single o gruppi di amici che vogliono trascorrere una vacanza in completa armonia, vicino al centro di Marostica ma in un ambiente privato e tranquillo, riccamente arredata e dotata di ogni comfort. Le stanze sono molto luminose, con una meravigliosa vista sulle colline. Oltre al giardino esclusivo, di fronte alla casa c'è un'ampia area verde attrezzata con un parco giochi.`,
    facts: {
      surface: "120 m²",
      bedrooms: "2 camere",
      guests: "Fino a 4 ospiti",
      garden: "Giardino privato",
    },
  },
  buttons: { airbnb: "Prenota su Airbnb", booking: "Prenota su Booking.com" },
  home: {
    photos: { title: "Foto", description: "Guarda gli interni e gli spazi esterni della casa." },
    amenities: { title: "Servizi", description: "Tutti i comfort inclusi nel soggiorno." },
    availability: {
      title: "Disponibilità",
      description: "Controlla le date libere e richiedi la prenotazione direttamente.",
    },
  },
  photos: {
    title: "Foto",
    subtitle: "Gli spazi di Campo Marzio 47, dagli interni al giardino.",
    close: "Chiudi",
    prev: "Foto precedente",
    next: "Foto successiva",
    items: [
      {
        alt: "Soggiorno con tavolo in vetro, sedie bordeaux e giardino sullo sfondo",
        caption: "Soggiorno con tavolo in vetro, sedie bordeaux e giardino sullo sfondo",
      },
      {
        alt: "Soggiorno ampio con divano, TV, scala e zona pranzo",
        caption: "Soggiorno ampio con divano e TV",
      },
      {
        alt: "Camera matrimoniale con travi bianche e aria condizionata",
        caption: "Camera matrimoniale con travi a vista",
      },
      {
        alt: "Camera con letti a castello rossi",
        caption: "Camera con letti a castello",
      },
      {
        alt: "Bagno con doccia e pavimento in parquet",
        caption: "Bagno con doccia",
      },
    ],
  },
  amenities: {
    title: "Servizi",
    subtitle: "Tutto ciò che trovi incluso nel soggiorno.",
    items: [
      {
        icon: "Wifi",
        category: "Connettività",
        title: "WiFi gratuito",
        description: "Connessione ad alta velocità in tutta la casa.",
      },
      {
        icon: "Car",
        category: "Parcheggio",
        title: "Parcheggio privato",
        description: "Gratuito, proprio davanti all'ingresso.",
      },
      {
        icon: "Thermometer",
        category: "Clima",
        title: "Aria condizionata e riscaldamento",
        description: "In tutte le camere, per ogni stagione.",
      },
      {
        icon: "ChefHat",
        category: "Cucina",
        title: "Cucina privata completa",
        description: "Forno, piano cottura, lavastoviglie, frigorifero, caffettiera, bollitore.",
      },
      {
        icon: "Tv",
        category: "Intrattenimento",
        title: "Smart TV",
        description: "TV a schermo piatto nella zona soggiorno.",
      },
      {
        icon: "Trees",
        category: "Esterni",
        title: "Giardino privato e terrazza",
        description: "Giardino esclusivo e terrazza/balcone con vista città e colline.",
      },
      {
        icon: "WashingMachine",
        category: "Comfort",
        title: "Lavatrice, ferro e asciugacapelli",
        description: "Biancheria da letto e asciugamani inclusi.",
      },
      {
        icon: "DoorOpen",
        category: "Accesso",
        title: "Ingresso indipendente",
        description: "Insonorizzazione e giochi da tavolo (scacchi) inclusi.",
      },
    ],
  },
  reviews: {
    title: "Recensioni",
    subtitle: "Cosa dicono gli ospiti.",
    allOnAirbnb: "Tutte le recensioni su Airbnb",
    allOnBooking: "Tutte le recensioni su Booking.com",
  },
  availability: {
    title: "Disponibilità",
    subtitle: "Le prenotazioni si completano su Airbnb o Booking.com.",
    loading: "Caricamento calendario…",
    unconfigured: "Il calendario live non è ancora collegato.",
    error: "Il calendario non è disponibile in questo momento.",
    checkPlatforms: "Controlla le date direttamente sulle piattaforme di prenotazione:",
    legendUnavailable: "Non disponibile",
    rulesTitle: "Regole della casa",
    rules: [
      { label: "Check-in", value: "Dalle 15:00 (comunicare orario in anticipo)" },
      { label: "Check-out", value: "Entro le 10:00" },
      { label: "Ospiti massimi", value: "4" },
      { label: "Bambini", value: "Benvenuti (tutte le età)" },
      { label: "Animali", value: "Non ammessi" },
      { label: "Fumo", value: "Vietato" },
      { label: "Feste/eventi", value: "Non consentiti" },
      { label: "Culle/letti supplementari", value: "Non disponibili" },
    ],
  },
  bookingRequest: {
    title: "Richiedi una prenotazione",
    description:
      "Scegli le date che ti interessano dal calendario qui sopra e inviaci una richiesta: ti risponderemo per confermare la disponibilità e concordare insieme il pagamento. Non è un pagamento online.",
    nameLabel: "Nome e cognome",
    emailLabel: "Email",
    phoneLabel: "Telefono",
    checkinLabel: "Data di arrivo",
    checkoutLabel: "Data di partenza",
    guestsLabel: "Numero di ospiti",
    messagePlaceholder: "Note aggiuntive (facoltativo)",
    overlapWarning:
      "Attenzione: queste date risultano già occupate nel calendario. Puoi comunque inviare la richiesta se pensi si tratti di un errore.",
    submit: "Invia richiesta",
    sending: "Invio…",
    sentTitle: "Richiesta inviata",
    sentBody:
      "Grazie! Ti risponderemo il prima possibile per confermare la disponibilità e concordare il pagamento.",
    errorPrefix: "Invio non riuscito.",
    errorFallbackLink: "Scrivi direttamente via email",
  },
  contact: {
    title: "Contatti",
    subtitle: "Francesco è a tua disposizione.",
    languages: ["Italiano", "Inglese", "Francese"],
    namePlaceholder: "Nome",
    emailPlaceholder: "Email",
    arrivalLabel: "Arrivo",
    departureLabel: "Partenza",
    messagePlaceholder: "Messaggio",
    send: "Invia messaggio",
    sending: "Invio…",
    sent: "Messaggio inviato, grazie! Ti risponderemo il prima possibile.",
    errorPrefix: "Invio non riuscito.",
    errorFallbackLink: "Scrivi direttamente via email",
  },
  checkin: {
    title: "Check-in online",
    subtitle:
      "Inserisci i dati di ogni ospite prima dell'arrivo: ci consente di adempiere alla comunicazione obbligatoria dei flussi turistici regionali.",
    arrivalDate: "Data di arrivo",
    nights: "Numero di notti",
    guest: "Ospite",
    removeGuest: "Rimuovi ospite",
    lastName: "Cognome",
    firstName: "Nome",
    sex: "Sesso",
    male: "Maschio",
    female: "Femmina",
    birthDate: "Data di nascita",
    email: "Email",
    emailPlaceholder: "nome@esempio.it",
    citizenship: "Cittadinanza",
    citizenshipPlaceholder: "Cerca uno stato (es. Italia, Germania...)",
    residenceState: "Stato di residenza",
    residenceStatePlaceholder: "Cerca uno stato...",
    residencePlace: "Comune di residenza",
    residencePlacePlaceholder: "Cerca un comune (es. Roma)...",
    residenceAbroadPlace: "Località di residenza",
    residenceAbroadPlacePlaceholder: "es. Monaco di Baviera",
    residenceAddress: "Indirizzo di residenza",
    residenceAddressPlaceholder: "Via e numero civico",
    birthState: "Stato di nascita (facoltativo)",
    birthStatePlaceholder: "Cerca uno stato...",
    birthPlace: "Comune di nascita",
    birthPlacePlaceholder: "Cerca un comune (es. Milano)...",
    fiscalCode: "Codice fiscale",
    fiscalCodePlaceholder: "RSSMRA80A01H501U",
    fiscalCodeInvalid: "Codice fiscale non valido (16 caratteri).",
    documentType: "Tipo documento",
    documentTypes: [
      { code: "IDENT", label: "Carta d'identità" },
      { code: "PASOR", label: "Passaporto" },
      { code: "PATEN", label: "Patente di guida" },
      { code: "ALTRO", label: "Altro documento" },
    ],
    documentNumber: "Numero documento",
    issueState: "Stato di rilascio documento",
    issueStatePlaceholder: "Cerca uno stato...",
    issuePlace: "Comune di rilascio documento",
    issuePlacePlaceholder: "Cerca un comune...",
    tourismType: "Tipo di turismo",
    tourismTypeOptions: [
      { code: "Culturale", label: "Culturale" },
      { code: "Balneare", label: "Balneare" },
      { code: "Congressuale/Affari", label: "Congressuale/Affari" },
      { code: "Fieristico", label: "Fieristico" },
      { code: "Sportivo/Fitness", label: "Sportivo/Fitness" },
      { code: "Scolastico", label: "Scolastico" },
      { code: "Religioso", label: "Religioso" },
      { code: "Sociale", label: "Sociale" },
      { code: "Parchi Tematici", label: "Parchi tematici" },
      { code: "Termale/Trattamenti salute", label: "Termale/Trattamenti salute" },
      { code: "Enogastronomico", label: "Enogastronomico" },
      { code: "Cicloturismo", label: "Cicloturismo" },
      { code: "Escursionistico/Naturalistico", label: "Escursionistico/Naturalistico" },
      { code: "Altro motivo", label: "Altro motivo" },
      { code: "Non specificato", label: "Non specificato" },
    ],
    transportMeans: "Mezzo di trasporto",
    transportMeansOptions: [
      { code: "Auto", label: "Auto" },
      { code: "Aereo", label: "Aereo" },
      { code: "Aereo+Pullman", label: "Aereo + Pullman" },
      { code: "Aereo+Navetta/Taxi/Auto", label: "Aereo + Navetta/Taxi/Auto" },
      { code: "Aereo+Treno", label: "Aereo + Treno" },
      { code: "Treno", label: "Treno" },
      { code: "Pullman", label: "Pullman" },
      { code: "Caravan/Autocaravan", label: "Caravan/Autocaravan" },
      { code: "Barca/Nave/Traghetto", label: "Barca/Nave/Traghetto" },
      { code: "Moto", label: "Moto" },
      { code: "Bicicletta", label: "Bicicletta" },
      { code: "A piedi", label: "A piedi" },
      { code: "Altro mezzo", label: "Altro mezzo" },
      { code: "Non Specificato", label: "Non specificato" },
    ],
    addGuest: "Aggiungi ospite",
    consent:
      "Acconsento al trattamento dei miei dati personali ai fini della comunicazione statistica obbligatoria ai flussi turistici regionali (Ross1000). I dati vengono inviati via email all'host e non sono conservati sul server del sito.",
    submit: "Invia check-in",
    sending: "Invio…",
    sentTitle: "Check-in inviato",
    sentBody:
      "Grazie! I tuoi dati sono stati inviati all'host per la comunicazione obbligatoria ai flussi turistici. A presto a Marostica.",
    errorGeneric: "Invio non riuscito, riprova più tardi.",
    errorIncompletePlace:
      "Per ogni ospite seleziona un'opzione dalla lista per cittadinanza, stato e comune (non basta scrivere il testo).",
  },
};

export const en: Dictionary = {
  meta: {
    title: "Campo Marzio 47 — A modern townhouse in the heart of Marostica",
    description:
      "Modern townhouse in Marostica, 120 sqm, up to 4 guests. Book on Airbnb or Booking.com and complete online check-in.",
  },
  languageSwitcher: { label: "Language" },
  nav: {
    home: "The House",
    photos: "Photos",
    amenities: "Amenities",
    reviews: "Reviews",
    availability: "Availability",
    contact: "Contact",
    checkin: "Online check-in",
  },
  hero: {
    tagline: "A modern townhouse in the heart of Marostica",
    description: `Fully renovated in 2023 to the highest energy efficiency standard, this house is perfect for families, couples, solo travellers or groups of friends looking for a peaceful, harmonious stay close to the centre of Marostica, yet private and quiet. It's richly furnished and equipped with every comfort, with bright rooms and a wonderful view over the hills. Besides the private garden, there's a large green area with a playground right in front of the house.`,
    facts: {
      surface: "120 sqm",
      bedrooms: "2 bedrooms",
      guests: "Up to 4 guests",
      garden: "Private garden",
    },
  },
  buttons: { airbnb: "Book on Airbnb", booking: "Book on Booking.com" },
  home: {
    photos: { title: "Photos", description: "See the interiors and outdoor spaces of the house." },
    amenities: { title: "Amenities", description: "All the comforts included in your stay." },
    availability: {
      title: "Availability",
      description: "Check open dates and request your booking directly.",
    },
  },
  photos: {
    title: "Photos",
    subtitle: "The spaces of Campo Marzio 47, from the interiors to the garden.",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    items: [
      {
        alt: "Living room with glass table, burgundy chairs and garden in the background",
        caption: "Living room with glass table, burgundy chairs and garden in the background",
      },
      {
        alt: "Spacious living room with sofa, TV and staircase",
        caption: "Spacious living room with sofa and TV",
      },
      {
        alt: "Double bedroom with white beams and air conditioning",
        caption: "Double bedroom with exposed beams",
      },
      {
        alt: "Bedroom with red bunk beds",
        caption: "Bedroom with bunk beds",
      },
      {
        alt: "Bathroom with shower and parquet floor",
        caption: "Bathroom with shower",
      },
    ],
  },
  amenities: {
    title: "Amenities",
    subtitle: "Everything included in your stay.",
    items: [
      {
        icon: "Wifi",
        category: "Connectivity",
        title: "Free WiFi",
        description: "High-speed connection throughout the house.",
      },
      {
        icon: "Car",
        category: "Parking",
        title: "Private parking",
        description: "Free, right in front of the entrance.",
      },
      {
        icon: "Thermometer",
        category: "Climate",
        title: "Air conditioning and heating",
        description: "In every room, for every season.",
      },
      {
        icon: "ChefHat",
        category: "Kitchen",
        title: "Fully equipped private kitchen",
        description: "Oven, hob, dishwasher, fridge, coffee machine, kettle.",
      },
      {
        icon: "Tv",
        category: "Entertainment",
        title: "Smart TV",
        description: "Flat-screen TV in the living area.",
      },
      {
        icon: "Trees",
        category: "Outdoors",
        title: "Private garden and terrace",
        description: "Exclusive garden and terrace/balcony with a view of the town and hills.",
      },
      {
        icon: "WashingMachine",
        category: "Comfort",
        title: "Washing machine, iron and hairdryer",
        description: "Bed linen and towels included.",
      },
      {
        icon: "DoorOpen",
        category: "Access",
        title: "Independent entrance",
        description: "Soundproofing and board games (chess) included.",
      },
    ],
  },
  reviews: {
    title: "Reviews",
    subtitle: "What guests say.",
    allOnAirbnb: "All reviews on Airbnb",
    allOnBooking: "All reviews on Booking.com",
  },
  availability: {
    title: "Availability",
    subtitle: "Bookings are completed on Airbnb or Booking.com.",
    loading: "Loading calendar…",
    unconfigured: "The live calendar isn't connected yet.",
    error: "The calendar isn't available right now.",
    checkPlatforms: "Check dates directly on the booking platforms:",
    legendUnavailable: "Not available",
    rulesTitle: "House rules",
    rules: [
      { label: "Check-in", value: "From 3:00 PM (please share your arrival time in advance)" },
      { label: "Check-out", value: "By 10:00 AM" },
      { label: "Max guests", value: "4" },
      { label: "Children", value: "Welcome (all ages)" },
      { label: "Pets", value: "Not allowed" },
      { label: "Smoking", value: "Not allowed" },
      { label: "Parties/events", value: "Not allowed" },
      { label: "Extra beds/cots", value: "Not available" },
    ],
  },
  bookingRequest: {
    title: "Request a booking",
    description:
      "Pick the dates you're interested in from the calendar above and send us a request: we'll get back to you to confirm availability and arrange payment together. This is not an online payment.",
    nameLabel: "Full name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    checkinLabel: "Arrival date",
    checkoutLabel: "Departure date",
    guestsLabel: "Number of guests",
    messagePlaceholder: "Additional notes (optional)",
    overlapWarning:
      "Heads up: these dates already appear as booked on the calendar. You can still send the request if you think this is a mistake.",
    submit: "Send request",
    sending: "Sending…",
    sentTitle: "Request sent",
    sentBody:
      "Thank you! We'll get back to you as soon as possible to confirm availability and arrange payment.",
    errorPrefix: "Sending failed.",
    errorFallbackLink: "Write directly via email",
  },
  contact: {
    title: "Contact",
    subtitle: "Francesco is at your disposal.",
    languages: ["Italian", "English", "French"],
    namePlaceholder: "Name",
    emailPlaceholder: "Email",
    arrivalLabel: "Arrival",
    departureLabel: "Departure",
    messagePlaceholder: "Message",
    send: "Send message",
    sending: "Sending…",
    sent: "Message sent, thank you! We'll get back to you as soon as possible.",
    errorPrefix: "Sending failed.",
    errorFallbackLink: "Write directly via email",
  },
  checkin: {
    title: "Online check-in",
    subtitle:
      "Enter each guest's details before arrival: it lets us fulfil the mandatory regional tourism-flow reporting requirement.",
    arrivalDate: "Arrival date",
    nights: "Number of nights",
    guest: "Guest",
    removeGuest: "Remove guest",
    lastName: "Last name",
    firstName: "First name",
    sex: "Sex",
    male: "Male",
    female: "Female",
    birthDate: "Date of birth",
    email: "Email",
    emailPlaceholder: "name@example.com",
    citizenship: "Citizenship",
    citizenshipPlaceholder: "Search a country (e.g. Italy, Germany...)",
    residenceState: "Country of residence",
    residenceStatePlaceholder: "Search a country...",
    residencePlace: "City of residence",
    residencePlacePlaceholder: "Search a comune (e.g. Rome)...",
    residenceAbroadPlace: "Place of residence",
    residenceAbroadPlacePlaceholder: "e.g. Munich",
    residenceAddress: "Residential address",
    residenceAddressPlaceholder: "Street and house number",
    birthState: "Country of birth (optional)",
    birthStatePlaceholder: "Search a country...",
    birthPlace: "City of birth",
    birthPlacePlaceholder: "Search a comune (e.g. Milan)...",
    fiscalCode: "Italian tax code (codice fiscale)",
    fiscalCodePlaceholder: "RSSMRA80A01H501U",
    fiscalCodeInvalid: "Invalid tax code (16 characters).",
    documentType: "Document type",
    documentTypes: [
      { code: "IDENT", label: "ID card" },
      { code: "PASOR", label: "Passport" },
      { code: "PATEN", label: "Driving licence" },
      { code: "ALTRO", label: "Other document" },
    ],
    documentNumber: "Document number",
    issueState: "Document issue country",
    issueStatePlaceholder: "Search a country...",
    issuePlace: "Document issue comune",
    issuePlacePlaceholder: "Search a comune...",
    tourismType: "Type of tourism",
    tourismTypeOptions: [
      { code: "Culturale", label: "Cultural" },
      { code: "Balneare", label: "Seaside/Beach" },
      { code: "Congressuale/Affari", label: "Business/Conference" },
      { code: "Fieristico", label: "Trade fair" },
      { code: "Sportivo/Fitness", label: "Sports/Fitness" },
      { code: "Scolastico", label: "School" },
      { code: "Religioso", label: "Religious" },
      { code: "Sociale", label: "Social" },
      { code: "Parchi Tematici", label: "Theme parks" },
      { code: "Termale/Trattamenti salute", label: "Spa/Wellness" },
      { code: "Enogastronomico", label: "Food & wine" },
      { code: "Cicloturismo", label: "Cycling" },
      { code: "Escursionistico/Naturalistico", label: "Hiking/Nature" },
      { code: "Altro motivo", label: "Other" },
      { code: "Non specificato", label: "Not specified" },
    ],
    transportMeans: "Means of transport",
    transportMeansOptions: [
      { code: "Auto", label: "Car" },
      { code: "Aereo", label: "Plane" },
      { code: "Aereo+Pullman", label: "Plane + Coach" },
      { code: "Aereo+Navetta/Taxi/Auto", label: "Plane + Shuttle/Taxi/Car" },
      { code: "Aereo+Treno", label: "Plane + Train" },
      { code: "Treno", label: "Train" },
      { code: "Pullman", label: "Coach" },
      { code: "Caravan/Autocaravan", label: "Caravan/Motorhome" },
      { code: "Barca/Nave/Traghetto", label: "Boat/Ship/Ferry" },
      { code: "Moto", label: "Motorbike" },
      { code: "Bicicletta", label: "Bicycle" },
      { code: "A piedi", label: "On foot" },
      { code: "Altro mezzo", label: "Other" },
      { code: "Non Specificato", label: "Not specified" },
    ],
    addGuest: "Add guest",
    consent:
      "I consent to the processing of my personal data for the mandatory regional tourism-flow statistical reporting (Ross1000). Data is sent by email to the host and is not stored on the site's server.",
    submit: "Submit check-in",
    sending: "Sending…",
    sentTitle: "Check-in submitted",
    sentBody:
      "Thank you! Your details have been sent to the host for the mandatory tourism-flow reporting. See you soon in Marostica.",
    errorGeneric: "Sending failed, please try again later.",
    errorIncompletePlace:
      "For each guest, pick an option from the list for citizenship, country and city (typing text alone isn't enough).",
  },
};

export const dictionaries = { it, en };
