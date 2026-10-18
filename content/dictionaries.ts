import type { DocumentTypeCode, TipoTurismo, MezzoTrasporto } from "@/lib/checkin-types";
import type { TravellerGroup } from "@/content/property";
import type { Locale } from "@/lib/locale";

/** Singolare/plurale con il segnaposto {n}: "{n} notte" / "{n} notti". */
export type Plural = { one: string; other: string };

/**
 * Nei titoli, il testo fra asterischi va in corsivo: "La casa *di tutti*".
 * Lo rende components/Emphasis.tsx; negli attributi (alt, aria-label) gli
 * asterischi non vanno usati.
 */
export type Dictionary = {
  meta: {
    title: string;
    description: string;
    // Descrizione specifica di ogni pagina interna. Serve per SEO: pagine
    // diverse con la stessa description vengono trattate da Google come
    // quasi-duplicati. Le chiavi corrispondono alle sezioni omonime del
    // dizionario (booking/checkin/contact), da cui si prende il titolo.
    pages: {
      booking: { description: string };
      checkin: { description: string };
      contact: { description: string };
      privacy: { description: string };
      cookies: { description: string };
      terms: { description: string };
    };
  };
  languageSwitcher: { label: string };
  // Stringhe che esistono solo per chi naviga da tastiera o con uno screen
  // reader: non sono mai visibili a schermo (tranne skipToContent, che
  // compare al primo Tab), ma vanno tradotte come tutto il resto.
  a11y: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    mainNavigation: string;
    selectArrival: string;
    selectDeparture: string;
    ratingOutOfTen: string;
    photoDialog: string;
    datesDialog: string;
    suggestions: string;
    previousMonth: string;
    nextMonth: string;
    decrease: string;
    increase: string;
    thumbnails: string;
    showPhoto: string;
    reviews: string;
    showReview: string;
    progress: string;
  };
  footer: {
    legalHeading: string;
    contactHeading: string;
    languageHeading: string;
    cinLabel: string;
    cirLabel: string;
    vatLabel: string;
    taxCodeLabel: string;
    reaLabel: string;
    privacyLink: string;
    cookiesLink: string;
    termsLink: string;
  };
  // Presa visione dell'informativa, comune ai tre moduli. Non è un
  // consenso: per il check-in il trattamento è un obbligo di legge, per
  // gli altri due è l'esecuzione di misure precontrattuali. Vedi
  // /privacy.
  privacyAck: {
    label: string;
    linkText: string;
  };
  privacy: { eyebrow: string; title: string; subtitle: string };
  cookies: { eyebrow: string; title: string; subtitle: string };
  terms: { eyebrow: string; title: string; subtitle: string };
  legalPage: { lastUpdated: string };
  nav: {
    home: string;
    contact: string;
    checkin: string;
    book: string;
    menu: string;
    close: string;
  };
  hero: {
    // Frase d'apertura sotto la foto, in grande. Accetta *corsivo*.
    tagline: string;
    description: string;
    // Descrizione della foto di copertina per chi non la vede. Deve
    // descrivere l'immagine, non ripetere lo slogan.
    imageAlt: string;
    scroll: string;
  };
  facts: {
    guests: Plural;
    bedrooms: Plural;
    beds: Plural;
    bathrooms: Plural;
    surface: string;
  };
  // Richiamo al check-in subito sotto l'introduzione: chi apre il sito è
  // spesso un ospite che ha già prenotato su Airbnb o Booking.
  checkinPrompt: {
    title: string;
    body: string;
    cta: string;
  };
  availabilityBar: {
    cta: string;
    arrivalLabel: string;
    departureLabel: string;
    selectDate: string;
    perNight: string;
    minStay: string;
    pickArrival: string;
    pickDeparture: string;
    clear: string;
    nights: Plural;
  };
  buttons: { airbnb: string; booking: string };
  photos: {
    eyebrow: string;
    title: string;
    subtitle: string;
    close: string;
    prev: string;
    next: string;
    viewAll: string;
    // Stesso ordine di property.gallery.
    items: { alt: string; caption: string }[];
  };
  amenities: {
    eyebrow: string;
    title: string;
    subtitle: string;
    groups: { title: string; items: { label: string; detail: string }[] }[];
  };
  // Sezione "dove siamo" della home. Con `title` vuoto non compare.
  place: {
    eyebrow: string;
    title: string;
    body: string[];
    imageAlt: string;
    caption: string;
    points: { label: string; detail: string }[];
    mapsLink: string;
  };
  reviews: {
    eyebrow: string;
    title: string;
    subtitle: string;
    allOnAirbnb: string;
    allOnBooking: string;
    groups: Record<TravellerGroup, string>;
    prev: string;
    next: string;
    // Dichiarazione sulla provenienza delle recensioni, richiesta
    // dall'art. 22 comma 4-bis del Codice del consumo a chi le pubblica.
    provenance: string;
  };
  availability: {
    loading: string;
    unconfigured: string;
    error: string;
    legendUnavailable: string;
    legendSelected: string;
  };
  booking: {
    eyebrow: string;
    title: string;
    subtitle: string;
    promises: string[];
    stepDates: string;
    stepGuests: string;
    stepDetails: string;
    summaryTitle: string;
    guestsLabel: string;
    guestsHint: string;
    nameLabel: string;
    emailLabel: string;
    phoneLabel: string;
    nightsLabel: string;
    pricePerNightLabel: string;
    cleaningFeeLabel: string;
    totalLabel: string;
    minNightsWarning: string;
    noDates: string;
    missingDates: string;
    // Il riquadro del prezzo è un preventivo, non un importo dovuto: il
    // contratto nasce solo con la conferma scritta dell'host. Vedi /termini.
    quoteNote: string;
    messageLabel: string;
    messagePlaceholder: string;
    optionalLabel: string;
    submitButton: string;
    sendingLabel: string;
    errors: {
      validation_error: string;
      invalid_dates: string;
      min_nights: string;
      dates_unavailable: string;
      too_soon: string;
      server_error: string;
    };
  };
  bookingConfirmation: {
    title: string;
    subtitle: string;
    back: string;
  };
  contact: {
    eyebrow: string;
    title: string;
    subtitle: string;
    hostLabel: string;
    languagesLabel: string;
    languages: string[];
    call: string;
    write: string;
    whereLabel: string;
    directions: string;
    formTitle: string;
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
    eyebrow: string;
    title: string;
    subtitle: string;
    steps: {
      stay: string;
      primary: string;
      document: string;
      guest: string;
      review: string;
    };
    stepIntros: {
      stay: string;
      primary: string;
      document: string;
      guest: string;
      review: string;
    };
    groups: { identity: string; birth: string; residence: string };
    stepOf: string;
    next: string;
    back: string;
    edit: string;
    arrivalDate: string;
    nights: string;
    guestsCount: string;
    groupHint: string;
    nightsCount: Plural;
    guestsTotal: Plural;
    guest: string;
    primaryGuestLabel: string;
    lastName: string;
    firstName: string;
    sex: string;
    male: string;
    female: string;
    birthDate: string;
    email: string;
    emailPlaceholder: string;
    emailHint: string;
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
    reviewBorn: string;
    reviewDocument: string;
    // Spiegazione dei due adempimenti di legge, mostrata sopra la casella
    // di presa visione. Non è una richiesta di consenso: il trattamento è
    // obbligatorio per legge (art. 6.1.c GDPR).
    privacyNotice: string;
    submit: string;
    sending: string;
    sentTitle: string;
    sentBody: string;
    sentBack: string;
    errorGeneric: string;
    errorInvalid: string;
    errorIncompletePlace: string;
    selectFromListHint: string;
  };
};

export const it: Dictionary = {
  meta: {
    title: "Campo Marzio 47 — Casa vacanze in affitto breve a Marostica (VI)",
    // Max ~160 caratteri: oltre, Google taglia il testo nei risultati.
    description:
      "Campo Marzio 47: casa a schiera in affitto breve nel centro di Marostica (VI). 120 m², fino a 4 ospiti, giardino privato. Richiedi le date senza intermediari.",
    pages: {
      booking: {
        description:
          "Richiedi le tue date a Campo Marzio 47, Marostica (VI): verifica la disponibilità e invia una richiesta senza intermediari. Ti rispondiamo via email.",
      },
      checkin: {
        description:
          "Check-in online per gli ospiti di Campo Marzio 47: compila i dati dei documenti prima dell'arrivo e salta le pratiche una volta in casa.",
      },
      contact: {
        description:
          "Contatta Francesco, host di Campo Marzio 47 a Marostica (VI): telefono, email e modulo per domande su disponibilità, prezzi e soggiorno.",
      },
      privacy: {
        description:
          "Come Campo Marzio 47 tratta i dati personali raccolti dal sito: finalità, basi giuridiche, destinatari, tempi di conservazione e come esercitare i tuoi diritti.",
      },
      cookies: {
        description:
          "Questo sito usa un solo cookie tecnico, per ricordare la lingua. Nessuna statistica, nessuna pubblicità, nessun cookie di terze parti.",
      },
      terms: {
        description:
          "Condizioni di soggiorno a Campo Marzio 47: come nasce la prenotazione, prezzo, pagamento, cancellazione e obblighi di ospite e host.",
      },
    },
  },
  languageSwitcher: { label: "Lingua" },
  a11y: {
    skipToContent: "Vai al contenuto",
    openMenu: "Apri il menu",
    closeMenu: "Chiudi il menu",
    mainNavigation: "Navigazione principale",
    selectArrival: "Scegli la data di arrivo",
    selectDeparture: "Scegli la data di partenza",
    ratingOutOfTen: "Valutazione {rating} su 10",
    photoDialog: "Galleria fotografica",
    datesDialog: "Scelta delle date",
    suggestions: "Suggerimenti",
    previousMonth: "Mese precedente",
    nextMonth: "Mese successivo",
    decrease: "Diminuisci",
    increase: "Aumenta",
    thumbnails: "Miniature delle foto",
    showPhoto: "Mostra la foto {n}",
    reviews: "Recensioni degli ospiti",
    showReview: "Mostra la recensione {n}",
    progress: "Avanzamento del check-in",
  },
  footer: {
    legalHeading: "Dati dell'attività",
    contactHeading: "Contatti",
    languageHeading: "Lingua",
    cinLabel: "CIN",
    cirLabel: "CIR",
    vatLabel: "P. IVA",
    taxCodeLabel: "C.F.",
    reaLabel: "REA",
    privacyLink: "Privacy",
    cookiesLink: "Cookie",
    termsLink: "Termini e condizioni",
  },
  privacyAck: {
    label: "Ho letto l'{link} e so come vengono trattati i miei dati.",
    linkText: "informativa privacy",
  },
  privacy: {
    eyebrow: "Note legali",
    title: "Informativa privacy",
    subtitle: "Quali dati raccogliamo, perché, e cosa puoi chiederci.",
  },
  cookies: {
    eyebrow: "Note legali",
    title: "Cookie",
    subtitle: "Uno solo, tecnico. Nessun tracciamento.",
  },
  terms: {
    eyebrow: "Note legali",
    title: "Termini e condizioni",
    subtitle: "Le regole del soggiorno, in chiaro.",
  },
  legalPage: { lastUpdated: "Ultimo aggiornamento: {date}" },
  nav: {
    home: "La Casa",
    contact: "Contatti",
    checkin: "Check-in online",
    book: "Prenota ora",
    menu: "Menu",
    close: "Chiudi",
  },
  hero: {
    tagline:
      "Travi a vista, rovere chiaro e un giardino tutto per voi, *a pochi minuti dalla piazza degli scacchi.*",
    description:
      "Ristrutturata nel 2023, la casa è pensata per famiglie, coppie e piccoli gruppi di amici che cercano un soggiorno tranquillo vicino al centro di Marostica: luminosa, arredata con cura, con un giardino privato e un'area verde attrezzata proprio di fronte.",
    imageAlt:
      "La zona pranzo di Campo Marzio 47: tavolo in vetro con una scacchiera, sedie bordeaux, scala in acciaio e porta-finestra sul giardino",
    scroll: "Scorri",
  },
  facts: {
    guests: { one: "{n} ospite", other: "{n} ospiti" },
    bedrooms: { one: "{n} camera", other: "{n} camere" },
    beds: { one: "{n} letto", other: "{n} letti" },
    bathrooms: { one: "{n} bagno", other: "{n} bagni" },
    surface: "{n} m²",
  },
  checkinPrompt: {
    title: "Hai già prenotato?",
    body: "Fai il check-in online prima di partire: all'arrivo non ci sarà nessun modulo da compilare.",
    cta: "Vai al check-in",
  },
  availabilityBar: {
    cta: "Verifica disponibilità",
    arrivalLabel: "Arrivo",
    departureLabel: "Partenza",
    selectDate: "Aggiungi data",
    perNight: "a notte",
    minStay: "minimo {n} notti",
    pickArrival: "Scegli il giorno di arrivo",
    pickDeparture: "Ora scegli il giorno di partenza",
    clear: "Cancella",
    nights: { one: "{n} notte", other: "{n} notti" },
  },
  buttons: { airbnb: "Prenota su Airbnb", booking: "Prenota su Booking.com" },
  photos: {
    eyebrow: "La casa",
    title: "Dentro *la casa*",
    subtitle: "Due piani, travi a vista e la luce che entra dal giardino.",
    close: "Chiudi",
    prev: "Foto precedente",
    next: "Foto successiva",
    viewAll: "Sfoglia tutte le {n} foto",
    items: [
      {
        alt: "Soggiorno con tavolo in vetro, sedie bordeaux, scala in acciaio e porta-finestra sul giardino",
        caption: "Il soggiorno, aperto sul giardino",
      },
      {
        alt: "Camera matrimoniale con travi bianche, letto con cuscini rossi e poltroncina",
        caption: "La camera matrimoniale, sotto le travi",
      },
      {
        alt: "Zona pranzo con tavolo in vetro, sedie bordeaux, libreria in legno e porta-finestra",
        caption: "La zona pranzo",
      },
      {
        alt: "Cucina bianca con forno, lavello, mensole in legno e porta-finestra sul balcone",
        caption: "La cucina, con il balcone sul verde",
      },
      {
        alt: "Soggiorno con divano grigio, tappeto colorato, smart TV e scala",
        caption: "Il divano e la smart TV",
      },
      {
        alt: "Seconda camera con letto a castello rosso, armadio e finestra",
        caption: "La seconda camera, con il letto a castello",
      },
      {
        alt: "Bagno con doccia in cristallo, lavabo e pavimento in legno",
        caption: "Il bagno con doccia",
      },
      {
        alt: "Secondo bagno con lavabo e porta-finestra sul balcone",
        caption: "Il secondo bagno",
      },
      {
        alt: "Giardino privato con prato, camminamento in pietra e terrazza in legno con una sdraio",
        caption: "Il giardino e la terrazza in legno",
      },
      {
        alt: "Il parco alberato di fronte alla casa e, sulla collina, il Castello Superiore di Marostica",
        caption: "Il verde di fronte e, in alto, il Castello Superiore",
      },
      {
        alt: "L'ingresso indipendente con la porta verde e la targa Campo Marzio 47",
        caption: "L'ingresso indipendente",
      },
    ],
  },
  amenities: {
    eyebrow: "Servizi",
    title: "Cosa trovi *in casa*",
    subtitle: "Tutto incluso nel prezzo, senza supplementi.",
    groups: [
      {
        title: "Dentro",
        items: [
          { label: "Aria condizionata e riscaldamento", detail: "In ogni camera" },
          { label: "Wi-Fi", detail: "Gratuito, in tutta la casa" },
          {
            label: "Cucina completa",
            detail: "Forno, piano cottura, lavastoviglie, frigorifero, caffettiera, bollitore",
          },
          { label: "Smart TV", detail: "Nel soggiorno" },
          { label: "Biancheria e asciugamani", detail: "Già pronti all'arrivo" },
          { label: "Lavatrice, ferro e asciugacapelli", detail: "Per i soggiorni più lunghi" },
          { label: "Una scacchiera", detail: "Sul tavolo del soggiorno: a Marostica non poteva mancare" },
        ],
      },
      {
        title: "Fuori",
        items: [
          { label: "Giardino privato", detail: "Con terrazza in legno, solo per voi" },
          { label: "Balcone", detail: "Con vista sulla città e sulle colline" },
          { label: "Parcheggio privato", detail: "Gratuito, davanti all'ingresso" },
          { label: "Ingresso indipendente", detail: "Arrivate e ripartite quando volete" },
        ],
      },
    ],
  },
  place: {
    eyebrow: "Dove siamo",
    title: "Marostica, *la città degli scacchi*",
    body: [
      "Ogni due anni, a settembre, la piazza del castello diventa una scacchiera e le pedine sono persone in costume: è la Partita a Scacchi di Marostica. Il resto dell'anno restano le mura, i due castelli e un centro storico che si gira a piedi.",
      "Campo Marzio 47 è a pochi minuti dal centro. Davanti c'è un'area verde attrezzata e, in alto, oltre gli alberi, il Castello Superiore.",
    ],
    imageAlt:
      "Il parco alberato di fronte alla casa e, sulla collina, il Castello Superiore di Marostica",
    caption: "Il Castello Superiore, visto da casa",
    points: [
      { label: "Centro storico", detail: "Pochi minuti" },
      { label: "Area verde attrezzata", detail: "Di fronte a casa" },
      { label: "Parcheggio privato", detail: "Davanti all'ingresso" },
    ],
    mapsLink: "Apri in Mappe",
  },
  reviews: {
    eyebrow: "Ospiti",
    title: "Chi è *già stato qui*",
    subtitle: "Recensioni da Airbnb e Booking.com, nella lingua in cui sono state scritte.",
    allOnAirbnb: "Tutte le recensioni su Airbnb",
    allOnBooking: "Tutte le recensioni su Booking.com",
    groups: {
      family: "Famiglia",
      group: "Gruppo",
      couple: "Coppia",
      solo: "Viaggiatore singolo",
      friends: "Amici",
      business: "Lavoro",
    },
    prev: "Recensione precedente",
    next: "Recensione successiva",
    provenance:
      "Le recensioni qui sopra sono state scritte da ospiti che hanno effettivamente soggiornato nella casa e sono pubblicate su Airbnb e Booking.com, dove ciascuna piattaforma verifica che l'autore abbia davvero prenotato. Le riportiamo nella lingua originale, senza modificarle. Non offriamo nulla in cambio di una recensione.",
  },
  availability: {
    loading: "Caricamento del calendario…",
    unconfigured: "Il calendario live non è ancora collegato.",
    error: "Il calendario non è disponibile in questo momento.",
    legendUnavailable: "Non disponibile",
    legendSelected: "Le tue date",
  },
  booking: {
    eyebrow: "Prenotazione diretta",
    title: "Prenota",
    subtitle:
      "Scegli le date e mandaci una richiesta. Nessun pagamento online: ti rispondiamo noi, per email, di solito entro un paio di giorni.",
    promises: ["Nessuna carta richiesta", "Nessun intermediario", "Risposta via email"],
    stepDates: "Le date",
    stepGuests: "Gli ospiti",
    stepDetails: "I tuoi dati",
    summaryTitle: "Riepilogo",
    guestsLabel: "Numero di ospiti",
    guestsHint: "Bambini compresi, massimo {max}",
    nameLabel: "Nome e cognome",
    emailLabel: "Email",
    phoneLabel: "Telefono",
    nightsLabel: "Notti",
    pricePerNightLabel: "Prezzo per notte",
    cleaningFeeLabel: "Pulizie finali",
    totalLabel: "Totale indicativo",
    minNightsWarning: "Il soggiorno minimo è di {min} notti.",
    noDates: "Nessuna data scelta",
    missingDates: "Scegli prima le date di arrivo e partenza.",
    quoteNote:
      "Preventivo indicativo: non è una prenotazione e non ti impegna. Il prezzo definitivo è quello della nostra email di conferma.",
    messageLabel: "Messaggio",
    messagePlaceholder: "Orario di arrivo, bambini, domande…",
    optionalLabel: "facoltativo",
    submitButton: "Invia richiesta",
    sendingLabel: "Invio…",
    errors: {
      validation_error: "Dati non validi. Controlla i campi e riprova.",
      invalid_dates: "Le date inserite non sono valide.",
      min_nights: "Il soggiorno minimo non è stato rispettato.",
      dates_unavailable: "Queste date non sono più disponibili.",
      too_soon: "Serve più preavviso prima dell'arrivo per questa data.",
      server_error: "Qualcosa è andato storto, riprova più tardi.",
    },
  },
  bookingConfirmation: {
    title: "Richiesta ricevuta",
    subtitle:
      "Grazie! Ti abbiamo mandato una email di riepilogo. Ti rispondiamo di solito entro un paio di giorni: finché non ricevi la nostra conferma scritta, le date non sono ancora riservate.",
    back: "Torna alla casa",
  },
  contact: {
    eyebrow: "Contatti",
    title: "Scrivici, *o chiamaci*",
    subtitle: "Francesco risponde di persona, anche durante il soggiorno.",
    hostLabel: "Il tuo host",
    languagesLabel: "Parla",
    languages: ["italiano", "inglese", "francese"],
    call: "Chiama",
    write: "Scrivi",
    whereLabel: "Indirizzo",
    directions: "Indicazioni stradali",
    formTitle: "Oppure lascia un messaggio",
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
    eyebrow: "Prima dell'arrivo",
    title: "Check-in online",
    subtitle:
      "Pochi minuti adesso, nessun modulo all'arrivo. La legge ci chiede di comunicare chi alloggia in casa: i dati arrivano solo all'host.",
    steps: {
      stay: "Il soggiorno",
      primary: "Chi prenota",
      document: "Documento",
      guest: "Ospite {n}",
      review: "Conferma",
    },
    stepIntros: {
      stay: "Quando arrivate e quanti siete.",
      primary: "I dati di chi presenta il gruppo, come compaiono sul documento.",
      document: "Lo stesso documento che mostrerete all'arrivo. Serve solo per chi presenta il gruppo.",
      guest: "Per gli altri ospiti bastano i dati anagrafici, nessun documento.",
      review: "Controlla che sia tutto giusto, poi invia.",
    },
    groups: { identity: "Anagrafica", birth: "Nascita", residence: "Residenza" },
    stepOf: "Passo {n} di {total}",
    next: "Continua",
    back: "Indietro",
    edit: "Modifica",
    arrivalDate: "Data di arrivo",
    nights: "Notti",
    guestsCount: "Ospiti, bambini compresi",
    groupHint: "Valgono per tutto il gruppo: servono alla statistica regionale.",
    nightsCount: { one: "{n} notte", other: "{n} notti" },
    guestsTotal: { one: "{n} ospite", other: "{n} ospiti" },
    guest: "Ospite",
    primaryGuestLabel: "Ospite principale",
    lastName: "Cognome",
    firstName: "Nome",
    sex: "Sesso",
    male: "Maschio",
    female: "Femmina",
    birthDate: "Data di nascita",
    email: "Email",
    emailPlaceholder: "nome@esempio.it",
    emailHint: "Solo per contattarti in caso di problemi con l'arrivo.",
    citizenship: "Cittadinanza",
    citizenshipPlaceholder: "Cerca uno stato (es. Italia, Germania…)",
    residenceState: "Stato di residenza",
    residenceStatePlaceholder: "Cerca uno stato…",
    residencePlace: "Comune di residenza",
    residencePlacePlaceholder: "Cerca un comune (es. Roma)…",
    residenceAbroadPlace: "Località di residenza",
    residenceAbroadPlacePlaceholder: "es. Monaco di Baviera",
    residenceAddress: "Indirizzo di residenza",
    residenceAddressPlaceholder: "Via e numero civico",
    birthState: "Stato di nascita",
    birthStatePlaceholder: "Cerca uno stato…",
    birthPlace: "Comune di nascita",
    birthPlacePlaceholder: "Cerca un comune (es. Milano)…",
    fiscalCode: "Codice fiscale",
    fiscalCodePlaceholder: "RSSMRA80A01H501U",
    fiscalCodeInvalid: "Codice fiscale non valido: servono 16 caratteri.",
    documentType: "Tipo di documento",
    documentTypes: [
      { code: "IDENT", label: "Carta d'identità" },
      { code: "PASOR", label: "Passaporto" },
      { code: "PATEN", label: "Patente" },
      { code: "ALTRO", label: "Altro" },
    ],
    documentNumber: "Numero del documento",
    issueState: "Stato di rilascio",
    issueStatePlaceholder: "Cerca uno stato…",
    issuePlace: "Comune di rilascio",
    issuePlacePlaceholder: "Cerca un comune…",
    tourismType: "Motivo del viaggio",
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
      { code: "Non specificato", label: "Preferisco non specificare" },
    ],
    transportMeans: "Come arrivate",
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
      { code: "Non Specificato", label: "Preferisco non specificare" },
    ],
    reviewBorn: "Nato/a il {date}",
    reviewDocument: "{type} n. {number}",
    privacyNotice:
      "Questi dati ci servono per due comunicazioni che la legge ci impone: quella alla Questura tramite il portale Alloggiati Web (art. 109 T.U.L.P.S.) e la rilevazione statistica del movimento turistico verso la Regione del Veneto (Ross1000). Non è un consenso facoltativo: senza questi dati non possiamo ospitarti. I dati vengono trasmessi via email all'host e non restano sul server del sito.",
    submit: "Invia check-in",
    sending: "Invio…",
    sentTitle: "Check-in inviato",
    sentBody:
      "Grazie! I tuoi dati sono arrivati all'host per le comunicazioni obbligatorie. All'arrivo non ci sarà nulla da compilare. A presto a Marostica.",
    sentBack: "Torna alla casa",
    errorGeneric: "Invio non riuscito, riprova più tardi.",
    errorInvalid: "Alcuni dati non sono validi o mancano: controlla i passaggi precedenti.",
    errorIncompletePlace:
      "Alcuni campi non sono stati scelti dalla lista: controlla quelli evidenziati.",
    selectFromListHint: "Scegli un'opzione dalla lista.",
  },
};

export const en: Dictionary = {
  meta: {
    title: "Campo Marzio 47 — Short-term rental home in Marostica (VI), Italy",
    // Max ~160 caratteri: oltre, Google taglia il testo nei risultati.
    description:
      "Campo Marzio 47: townhouse for short-term rental in central Marostica, Italy. 120 sqm, up to 4 guests, private garden. Request your dates, no middlemen.",
    pages: {
      booking: {
        description:
          "Request your dates at Campo Marzio 47 in Marostica (VI), Italy: check availability and send a request with no middlemen. We reply by email.",
      },
      checkin: {
        description:
          "Online check-in for guests of Campo Marzio 47: submit your ID details before arrival and skip the paperwork once you get to the house.",
      },
      contact: {
        description:
          "Get in touch with Francesco, host of Campo Marzio 47 in Marostica (VI), Italy: phone, email and a form for questions about availability, rates and your stay.",
      },
      privacy: {
        description:
          "How Campo Marzio 47 handles the personal data collected through this site: purposes, legal bases, recipients, retention and how to exercise your rights.",
      },
      cookies: {
        description:
          "This website uses a single technical cookie, to remember your language. No analytics, no advertising, no third-party cookies.",
      },
      terms: {
        description:
          "Terms of stay at Campo Marzio 47: how a booking is formed, price, payment, cancellation and the obligations of guest and host.",
      },
    },
  },
  languageSwitcher: { label: "Language" },
  a11y: {
    skipToContent: "Skip to content",
    openMenu: "Open the menu",
    closeMenu: "Close the menu",
    mainNavigation: "Main navigation",
    selectArrival: "Choose the arrival date",
    selectDeparture: "Choose the departure date",
    ratingOutOfTen: "Rated {rating} out of 10",
    photoDialog: "Photo gallery",
    datesDialog: "Date selection",
    suggestions: "Suggestions",
    previousMonth: "Previous month",
    nextMonth: "Next month",
    decrease: "Decrease",
    increase: "Increase",
    thumbnails: "Photo thumbnails",
    showPhoto: "Show photo {n}",
    reviews: "Guest reviews",
    showReview: "Show review {n}",
    progress: "Check-in progress",
  },
  footer: {
    legalHeading: "Business details",
    contactHeading: "Contact",
    languageHeading: "Language",
    cinLabel: "CIN",
    cirLabel: "CIR",
    vatLabel: "VAT no.",
    taxCodeLabel: "Tax code",
    reaLabel: "Companies Register",
    privacyLink: "Privacy",
    cookiesLink: "Cookies",
    termsLink: "Terms and conditions",
  },
  privacyAck: {
    label: "I have read the {link} and understand how my data is handled.",
    linkText: "privacy notice",
  },
  privacy: {
    eyebrow: "Legal",
    title: "Privacy notice",
    subtitle: "What we collect, why, and what you can ask us.",
  },
  cookies: {
    eyebrow: "Legal",
    title: "Cookies",
    subtitle: "One, technical. No tracking.",
  },
  terms: {
    eyebrow: "Legal",
    title: "Terms and conditions",
    subtitle: "The rules of your stay, in plain words.",
  },
  legalPage: { lastUpdated: "Last updated: {date}" },
  nav: {
    home: "The House",
    contact: "Contact",
    checkin: "Online check-in",
    book: "Book now",
    menu: "Menu",
    close: "Close",
  },
  hero: {
    tagline:
      "Exposed beams, pale oak and a garden all to yourselves, *a few minutes from the chess square.*",
    description:
      "Renovated in 2023, the house is made for families, couples and small groups of friends looking for a quiet stay close to the centre of Marostica: bright, thoughtfully furnished, with a private garden and a green area with a playground right in front.",
    imageAlt:
      "The dining area of Campo Marzio 47: glass table with a chessboard, burgundy chairs, steel staircase and a French window onto the garden",
    scroll: "Scroll",
  },
  facts: {
    guests: { one: "{n} guest", other: "{n} guests" },
    bedrooms: { one: "{n} bedroom", other: "{n} bedrooms" },
    beds: { one: "{n} bed", other: "{n} beds" },
    bathrooms: { one: "{n} bathroom", other: "{n} bathrooms" },
    surface: "{n} sqm",
  },
  checkinPrompt: {
    title: "Already booked?",
    body: "Do your online check-in before you leave: there will be no forms to fill in when you arrive.",
    cta: "Go to check-in",
  },
  availabilityBar: {
    cta: "Check availability",
    arrivalLabel: "Arrival",
    departureLabel: "Departure",
    selectDate: "Add date",
    perNight: "per night",
    minStay: "{n}-night minimum",
    pickArrival: "Choose your arrival day",
    pickDeparture: "Now choose your departure day",
    clear: "Clear",
    nights: { one: "{n} night", other: "{n} nights" },
  },
  buttons: { airbnb: "Book on Airbnb", booking: "Book on Booking.com" },
  photos: {
    eyebrow: "The house",
    title: "Inside *the house*",
    subtitle: "Two floors, exposed beams and the light coming in from the garden.",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
    viewAll: "Browse all {n} photos",
    items: [
      {
        alt: "Living room with glass table, burgundy chairs, steel staircase and a French window onto the garden",
        caption: "The living room, opening onto the garden",
      },
      {
        alt: "Double bedroom with white beams, a bed with red cushions and an armchair",
        caption: "The double bedroom, under the beams",
      },
      {
        alt: "Dining area with glass table, burgundy chairs, wooden bookcase and a French window",
        caption: "The dining area",
      },
      {
        alt: "White kitchen with oven, sink, wooden shelves and a French window onto the balcony",
        caption: "The kitchen, with its balcony over the green",
      },
      {
        alt: "Living room with grey sofa, colourful rug, smart TV and staircase",
        caption: "The sofa and the smart TV",
      },
      {
        alt: "Second bedroom with a red bunk bed, wardrobe and window",
        caption: "The second bedroom, with the bunk bed",
      },
      {
        alt: "Bathroom with glass shower, washbasin and wooden floor",
        caption: "The bathroom with shower",
      },
      {
        alt: "Second bathroom with washbasin and a French window onto the balcony",
        caption: "The second bathroom",
      },
      {
        alt: "Private garden with lawn, stone path and a wooden deck with a sun lounger",
        caption: "The garden and the wooden deck",
      },
      {
        alt: "The tree-lined park in front of the house and, on the hill, Marostica's Upper Castle",
        caption: "The green in front and, up above, the Upper Castle",
      },
      {
        alt: "The private entrance with its green door and the Campo Marzio 47 sign",
        caption: "The private entrance",
      },
    ],
  },
  amenities: {
    eyebrow: "Amenities",
    title: "What you'll find *in the house*",
    subtitle: "All included in the price, no extras.",
    groups: [
      {
        title: "Inside",
        items: [
          { label: "Air conditioning and heating", detail: "In every room" },
          { label: "Wi-Fi", detail: "Free, throughout the house" },
          {
            label: "Fully equipped kitchen",
            detail: "Oven, hob, dishwasher, fridge, coffee maker, kettle",
          },
          { label: "Smart TV", detail: "In the living room" },
          { label: "Bed linen and towels", detail: "Ready when you arrive" },
          { label: "Washing machine, iron and hairdryer", detail: "For longer stays" },
          { label: "A chessboard", detail: "On the living-room table: this is Marostica, after all" },
        ],
      },
      {
        title: "Outside",
        items: [
          { label: "Private garden", detail: "With a wooden deck, just for you" },
          { label: "Balcony", detail: "With a view of the town and the hills" },
          { label: "Private parking", detail: "Free, right in front of the entrance" },
          { label: "Private entrance", detail: "Come and go as you please" },
        ],
      },
    ],
  },
  place: {
    eyebrow: "Where we are",
    title: "Marostica, *the chess town*",
    body: [
      "Every other September the castle square becomes a chessboard and the pieces are people in costume: this is Marostica's living Chess Game. The rest of the year there are the town walls, the two castles and a historic centre you can explore on foot.",
      "Campo Marzio 47 is a few minutes from the centre. In front of the house there is a green area with a playground and, up above the trees, the Upper Castle.",
    ],
    imageAlt:
      "The tree-lined park in front of the house and, on the hill, Marostica's Upper Castle",
    caption: "The Upper Castle, seen from the house",
    points: [
      { label: "Historic centre", detail: "A few minutes" },
      { label: "Green area with playground", detail: "Right in front" },
      { label: "Private parking", detail: "By the entrance" },
    ],
    mapsLink: "Open in Maps",
  },
  reviews: {
    eyebrow: "Guests",
    title: "Who's *been here*",
    subtitle: "Reviews from Airbnb and Booking.com, in the language they were written in.",
    allOnAirbnb: "All reviews on Airbnb",
    allOnBooking: "All reviews on Booking.com",
    groups: {
      family: "Family",
      group: "Group",
      couple: "Couple",
      solo: "Solo traveller",
      friends: "Friends",
      business: "Business",
    },
    prev: "Previous review",
    next: "Next review",
    provenance:
      "The reviews above were written by guests who actually stayed at the house and are published on Airbnb and Booking.com, where each platform verifies that the author really booked. We quote them in their original language, unedited. We never offer anything in exchange for a review.",
  },
  availability: {
    loading: "Loading calendar…",
    unconfigured: "The live calendar isn't connected yet.",
    error: "The calendar isn't available right now.",
    legendUnavailable: "Not available",
    legendSelected: "Your dates",
  },
  booking: {
    eyebrow: "Book direct",
    title: "Book",
    subtitle:
      "Pick your dates and send us a request. No online payment: we reply ourselves, by email, usually within a couple of days.",
    promises: ["No card details", "No middlemen", "Reply by email"],
    stepDates: "Dates",
    stepGuests: "Guests",
    stepDetails: "Your details",
    summaryTitle: "Summary",
    guestsLabel: "Number of guests",
    guestsHint: "Children included, up to {max}",
    nameLabel: "Full name",
    emailLabel: "Email",
    phoneLabel: "Phone",
    nightsLabel: "Nights",
    pricePerNightLabel: "Price per night",
    cleaningFeeLabel: "Cleaning fee",
    totalLabel: "Indicative total",
    minNightsWarning: "The minimum stay is {min} nights.",
    noDates: "No dates chosen",
    missingDates: "Please choose your arrival and departure dates first.",
    quoteNote:
      "Indicative quote: this is not a booking and does not commit you. The price that counts is the one in our confirmation email.",
    messageLabel: "Message",
    messagePlaceholder: "Arrival time, children, questions…",
    optionalLabel: "optional",
    submitButton: "Send request",
    sendingLabel: "Sending…",
    errors: {
      validation_error: "Invalid data. Please check the fields and try again.",
      invalid_dates: "The selected dates aren't valid.",
      min_nights: "The minimum stay requirement wasn't met.",
      dates_unavailable: "These dates are no longer available.",
      too_soon: "This date needs more advance notice before arrival.",
      server_error: "Something went wrong, please try again later.",
    },
  },
  bookingConfirmation: {
    title: "Request received",
    subtitle:
      "Thank you! We've sent you a summary by email. We usually reply within a couple of days: until you get our written confirmation, the dates are not reserved yet.",
    back: "Back to the house",
  },
  contact: {
    eyebrow: "Contact",
    title: "Write to us, *or call*",
    subtitle: "Francesco replies in person, during your stay too.",
    hostLabel: "Your host",
    languagesLabel: "Speaks",
    languages: ["Italian", "English", "French"],
    call: "Call",
    write: "Email",
    whereLabel: "Address",
    directions: "Get directions",
    formTitle: "Or leave a message",
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
    eyebrow: "Before you arrive",
    title: "Online check-in",
    subtitle:
      "A few minutes now, no forms on arrival. Italian law requires us to report who is staying in the house: your details go to the host only.",
    steps: {
      stay: "Your stay",
      primary: "Lead guest",
      document: "ID document",
      guest: "Guest {n}",
      review: "Confirm",
    },
    stepIntros: {
      stay: "When you arrive and how many of you there are.",
      primary: "The details of the person registering the group, as they appear on their ID.",
      document: "The same document you'll show on arrival. Only needed for the lead guest.",
      guest: "For the other guests, personal details are enough: no document needed.",
      review: "Check that everything is right, then send.",
    },
    groups: { identity: "Personal details", birth: "Birth", residence: "Residence" },
    stepOf: "Step {n} of {total}",
    next: "Continue",
    back: "Back",
    edit: "Edit",
    arrivalDate: "Arrival date",
    nights: "Nights",
    guestsCount: "Guests, children included",
    groupHint: "These apply to the whole group: they are used for regional statistics.",
    nightsCount: { one: "{n} night", other: "{n} nights" },
    guestsTotal: { one: "{n} guest", other: "{n} guests" },
    guest: "Guest",
    primaryGuestLabel: "Lead guest",
    lastName: "Last name",
    firstName: "First name",
    sex: "Sex",
    male: "Male",
    female: "Female",
    birthDate: "Date of birth",
    email: "Email",
    emailPlaceholder: "name@example.com",
    emailHint: "Only used to reach you if there is an issue with your arrival.",
    citizenship: "Citizenship",
    citizenshipPlaceholder: "Search a country (e.g. Germany, United Kingdom…)",
    residenceState: "Country of residence",
    residenceStatePlaceholder: "Search a country…",
    residencePlace: "Town of residence (Italy)",
    residencePlacePlaceholder: "Search an Italian town (e.g. Rome)…",
    residenceAbroadPlace: "Town of residence",
    residenceAbroadPlacePlaceholder: "e.g. Munich",
    residenceAddress: "Home address",
    residenceAddressPlaceholder: "Street and house number",
    birthState: "Country of birth",
    birthStatePlaceholder: "Search a country…",
    birthPlace: "Town of birth (Italy)",
    birthPlacePlaceholder: "Search an Italian town (e.g. Milan)…",
    fiscalCode: "Italian tax code (codice fiscale)",
    fiscalCodePlaceholder: "RSSMRA80A01H501U",
    fiscalCodeInvalid: "Invalid tax code: it must be 16 characters.",
    documentType: "Document type",
    documentTypes: [
      { code: "IDENT", label: "ID card" },
      { code: "PASOR", label: "Passport" },
      { code: "PATEN", label: "Driving licence" },
      { code: "ALTRO", label: "Other" },
    ],
    documentNumber: "Document number",
    issueState: "Issuing country",
    issueStatePlaceholder: "Search a country…",
    issuePlace: "Issuing town (Italy)",
    issuePlacePlaceholder: "Search an Italian town…",
    tourismType: "Purpose of the trip",
    tourismTypeOptions: [
      { code: "Culturale", label: "Culture" },
      { code: "Balneare", label: "Seaside" },
      { code: "Congressuale/Affari", label: "Business/Conference" },
      { code: "Fieristico", label: "Trade fair" },
      { code: "Sportivo/Fitness", label: "Sports/Fitness" },
      { code: "Scolastico", label: "School trip" },
      { code: "Religioso", label: "Religious" },
      { code: "Sociale", label: "Social" },
      { code: "Parchi Tematici", label: "Theme parks" },
      { code: "Termale/Trattamenti salute", label: "Spa/Wellness" },
      { code: "Enogastronomico", label: "Food & wine" },
      { code: "Cicloturismo", label: "Cycling" },
      { code: "Escursionistico/Naturalistico", label: "Hiking/Nature" },
      { code: "Altro motivo", label: "Other" },
      { code: "Non specificato", label: "Prefer not to say" },
    ],
    transportMeans: "How you're travelling",
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
      { code: "Non Specificato", label: "Prefer not to say" },
    ],
    reviewBorn: "Born {date}",
    reviewDocument: "{type} no. {number}",
    privacyNotice:
      "We need these details for two reports the law requires of us: the one to the police headquarters through the Alloggiati Web portal (Art. 109 of the Italian Public Security Act) and the tourist-movement statistics for the Veneto Region (Ross1000). This is not an optional consent: without these details we cannot host you. The data is emailed to the host and is not kept on the website's server.",
    submit: "Submit check-in",
    sending: "Sending…",
    sentTitle: "Check-in submitted",
    sentBody:
      "Thank you! Your details have reached the host for the mandatory reporting. There will be nothing to fill in when you arrive. See you soon in Marostica.",
    sentBack: "Back to the house",
    errorGeneric: "Sending failed, please try again later.",
    errorInvalid: "Some details are missing or invalid: please check the previous steps.",
    errorIncompletePlace:
      "Some fields weren't chosen from the list: please check the highlighted ones.",
    selectFromListHint: "Pick an option from the list.",
  },
};

export const de: Dictionary = {
  meta: {
    title: "Campo Marzio 47 — Ferienhaus in Marostica (Vicenza), Italien",
    // Max ~160 caratteri: oltre, Google taglia il testo nei risultati.
    description:
      "Campo Marzio 47: Reihenhaus zur Kurzzeitmiete im Zentrum von Marostica. 120 m², bis zu 4 Gäste, privater Garten. Termine direkt anfragen, ohne Vermittler.",
    pages: {
      booking: {
        description:
          "Fragen Sie Ihre Termine im Campo Marzio 47 in Marostica direkt an: Verfügbarkeit prüfen, Anfrage senden, ohne Vermittler. Wir antworten per E-Mail.",
      },
      checkin: {
        description:
          "Online-Check-in für Gäste des Campo Marzio 47: Ausweisdaten vor der Anreise eingeben und vor Ort keine Formulare mehr ausfüllen.",
      },
      contact: {
        description:
          "Kontakt zu Francesco, Gastgeber des Campo Marzio 47 in Marostica: Telefon, E-Mail und Formular für Fragen zu Verfügbarkeit, Preisen und Aufenthalt.",
      },
      privacy: {
        description:
          "Wie Campo Marzio 47 die über diese Website erhobenen Daten verarbeitet: Zwecke, Rechtsgrundlagen, Empfänger, Speicherdauer und Ihre Rechte.",
      },
      cookies: {
        description:
          "Diese Website verwendet ein einziges technisches Cookie, um die Sprache zu speichern. Keine Statistik, keine Werbung, keine Cookies von Dritten.",
      },
      terms: {
        description:
          "Aufenthaltsbedingungen im Campo Marzio 47: wie die Buchung zustande kommt, Preis, Zahlung, Stornierung sowie Pflichten von Gast und Gastgeber.",
      },
    },
  },
  languageSwitcher: { label: "Sprache" },
  a11y: {
    skipToContent: "Zum Inhalt springen",
    openMenu: "Menü öffnen",
    closeMenu: "Menü schließen",
    mainNavigation: "Hauptnavigation",
    selectArrival: "Anreisedatum wählen",
    selectDeparture: "Abreisedatum wählen",
    ratingOutOfTen: "Bewertung {rating} von 10",
    photoDialog: "Fotogalerie",
    datesDialog: "Datumsauswahl",
    suggestions: "Vorschläge",
    previousMonth: "Vorheriger Monat",
    nextMonth: "Nächster Monat",
    decrease: "Verringern",
    increase: "Erhöhen",
    thumbnails: "Fotovorschau",
    showPhoto: "Foto {n} anzeigen",
    reviews: "Gästebewertungen",
    showReview: "Bewertung {n} anzeigen",
    progress: "Fortschritt des Check-ins",
  },
  footer: {
    legalHeading: "Angaben zum Betrieb",
    contactHeading: "Kontakt",
    languageHeading: "Sprache",
    cinLabel: "CIN",
    cirLabel: "CIR",
    vatLabel: "USt-IdNr.",
    taxCodeLabel: "Steuernr.",
    reaLabel: "Handelsregister",
    privacyLink: "Datenschutz",
    cookiesLink: "Cookies",
    termsLink: "AGB",
  },
  privacyAck: {
    label: "Ich habe die {link} gelesen und weiß, wie meine Daten verarbeitet werden.",
    linkText: "Datenschutzerklärung",
  },
  privacy: {
    eyebrow: "Rechtliches",
    title: "Datenschutzerklärung",
    subtitle: "Welche Daten wir erheben, warum, und was Sie von uns verlangen können.",
  },
  cookies: {
    eyebrow: "Rechtliches",
    title: "Cookies",
    subtitle: "Nur eines, technisch. Kein Tracking.",
  },
  terms: {
    eyebrow: "Rechtliches",
    title: "Allgemeine Geschäftsbedingungen",
    subtitle: "Die Regeln Ihres Aufenthalts, klar formuliert.",
  },
  legalPage: { lastUpdated: "Zuletzt aktualisiert: {date}" },
  nav: {
    home: "Das Haus",
    contact: "Kontakt",
    checkin: "Online-Check-in",
    book: "Jetzt buchen",
    menu: "Menü",
    close: "Schließen",
  },
  hero: {
    tagline:
      "Sichtbare Holzbalken, helle Eiche und ein Garten ganz für Sie, *wenige Minuten vom Schachplatz entfernt.*",
    description:
      "Das 2023 renovierte Haus ist für Familien, Paare und kleine Freundesgruppen gedacht, die einen ruhigen Aufenthalt nahe dem Zentrum von Marostica suchen: hell, mit Sorgfalt eingerichtet, mit privatem Garten und einer Grünanlage mit Spielplatz direkt gegenüber.",
    imageAlt:
      "Der Essbereich des Campo Marzio 47: Glastisch mit Schachbrett, bordeauxrote Stühle, Stahltreppe und Fenstertür zum Garten",
    scroll: "Scrollen",
  },
  facts: {
    guests: { one: "{n} Gast", other: "{n} Gäste" },
    bedrooms: { one: "{n} Schlafzimmer", other: "{n} Schlafzimmer" },
    beds: { one: "{n} Bett", other: "{n} Betten" },
    bathrooms: { one: "{n} Bad", other: "{n} Bäder" },
    surface: "{n} m²",
  },
  checkinPrompt: {
    title: "Schon gebucht?",
    body: "Erledigen Sie den Online-Check-in vor der Abreise: Bei der Ankunft gibt es dann kein Formular mehr auszufüllen.",
    cta: "Zum Check-in",
  },
  availabilityBar: {
    cta: "Verfügbarkeit prüfen",
    arrivalLabel: "Anreise",
    departureLabel: "Abreise",
    selectDate: "Datum wählen",
    perNight: "pro Nacht",
    minStay: "mindestens {n} Nächte",
    pickArrival: "Wählen Sie den Anreisetag",
    pickDeparture: "Wählen Sie jetzt den Abreisetag",
    clear: "Löschen",
    nights: { one: "{n} Nacht", other: "{n} Nächte" },
  },
  buttons: { airbnb: "Auf Airbnb buchen", booking: "Auf Booking.com buchen" },
  photos: {
    eyebrow: "Das Haus",
    title: "Im *Haus*",
    subtitle: "Zwei Etagen, sichtbare Holzbalken und Licht, das aus dem Garten hereinfällt.",
    close: "Schließen",
    prev: "Vorheriges Foto",
    next: "Nächstes Foto",
    viewAll: "Alle {n} Fotos ansehen",
    items: [
      {
        alt: "Wohnraum mit Glastisch, bordeauxroten Stühlen, Stahltreppe und Fenstertür zum Garten",
        caption: "Der Wohnraum, zum Garten hin offen",
      },
      {
        alt: "Doppelzimmer mit weißen Holzbalken, Bett mit roten Kissen und Sessel",
        caption: "Das Doppelzimmer unter den Balken",
      },
      {
        alt: "Essbereich mit Glastisch, bordeauxroten Stühlen, Holzregal und Fenstertür",
        caption: "Der Essbereich",
      },
      {
        alt: "Weiße Küche mit Backofen, Spüle, Holzregalen und Fenstertür zum Balkon",
        caption: "Die Küche mit Balkon ins Grüne",
      },
      {
        alt: "Wohnraum mit grauem Sofa, buntem Teppich, Smart-TV und Treppe",
        caption: "Sofa und Smart-TV",
      },
      {
        alt: "Zweites Schlafzimmer mit rotem Etagenbett, Schrank und Fenster",
        caption: "Das zweite Schlafzimmer mit Etagenbett",
      },
      {
        alt: "Bad mit Glasdusche, Waschbecken und Holzboden",
        caption: "Das Bad mit Dusche",
      },
      {
        alt: "Zweites Bad mit Waschbecken und Fenstertür zum Balkon",
        caption: "Das zweite Bad",
      },
      {
        alt: "Privater Garten mit Rasen, Steinweg und Holzterrasse mit Liegestuhl",
        caption: "Der Garten und die Holzterrasse",
      },
      {
        alt: "Der Park mit Bäumen gegenüber dem Haus und auf dem Hügel die Obere Burg von Marostica",
        caption: "Das Grün gegenüber und oben die Obere Burg",
      },
      {
        alt: "Der eigene Eingang mit grüner Tür und dem Schild Campo Marzio 47",
        caption: "Der eigene Eingang",
      },
    ],
  },
  amenities: {
    eyebrow: "Ausstattung",
    title: "Was Sie *im Haus* erwartet",
    subtitle: "Alles im Preis inbegriffen, ohne Aufpreis.",
    groups: [
      {
        title: "Drinnen",
        items: [
          { label: "Klimaanlage und Heizung", detail: "In jedem Zimmer" },
          { label: "WLAN", detail: "Kostenlos, im ganzen Haus" },
          {
            label: "Voll ausgestattete Küche",
            detail: "Backofen, Kochfeld, Geschirrspüler, Kühlschrank, Kaffeemaschine, Wasserkocher",
          },
          { label: "Smart-TV", detail: "Im Wohnraum" },
          { label: "Bettwäsche und Handtücher", detail: "Bei Ankunft bereit" },
          { label: "Waschmaschine, Bügeleisen und Föhn", detail: "Für längere Aufenthalte" },
          { label: "Ein Schachbrett", detail: "Auf dem Wohnzimmertisch: In Marostica darf es nicht fehlen" },
        ],
      },
      {
        title: "Draußen",
        items: [
          { label: "Privater Garten", detail: "Mit Holzterrasse, nur für Sie" },
          { label: "Balkon", detail: "Mit Blick auf die Stadt und die Hügel" },
          { label: "Privatparkplatz", detail: "Kostenlos, direkt vor dem Eingang" },
          { label: "Eigener Eingang", detail: "Kommen und gehen Sie, wann Sie möchten" },
        ],
      },
    ],
  },
  place: {
    eyebrow: "Wo wir sind",
    title: "Marostica, *die Stadt des Schachspiels*",
    body: [
      "Alle zwei Jahre im September wird der Platz vor der Burg zum Schachbrett, und die Figuren sind Menschen in historischen Kostümen: die berühmte Schachpartie von Marostica. Den Rest des Jahres bleiben die Stadtmauern, die beiden Burgen und eine Altstadt, die man zu Fuß erkundet.",
      "Das Campo Marzio 47 liegt wenige Minuten vom Zentrum entfernt. Gegenüber gibt es eine Grünanlage mit Spielplatz und oben, über den Bäumen, die Obere Burg.",
    ],
    imageAlt:
      "Der Park mit Bäumen gegenüber dem Haus und auf dem Hügel die Obere Burg von Marostica",
    caption: "Die Obere Burg, vom Haus aus gesehen",
    points: [
      { label: "Altstadt", detail: "Wenige Minuten" },
      { label: "Grünanlage mit Spielplatz", detail: "Direkt gegenüber" },
      { label: "Privatparkplatz", detail: "Vor dem Eingang" },
    ],
    mapsLink: "In Karten öffnen",
  },
  reviews: {
    eyebrow: "Gäste",
    title: "Wer *schon hier war*",
    subtitle: "Bewertungen von Airbnb und Booking.com, in der Sprache, in der sie geschrieben wurden.",
    allOnAirbnb: "Alle Bewertungen auf Airbnb",
    allOnBooking: "Alle Bewertungen auf Booking.com",
    groups: {
      family: "Familie",
      group: "Gruppe",
      couple: "Paar",
      solo: "Alleinreisend",
      friends: "Freunde",
      business: "Geschäftsreise",
    },
    prev: "Vorherige Bewertung",
    next: "Nächste Bewertung",
    provenance:
      "Die obigen Bewertungen stammen von Gästen, die tatsächlich im Haus übernachtet haben, und sind auf Airbnb und Booking.com veröffentlicht, wo jede Plattform prüft, dass die Verfasser wirklich gebucht haben. Wir geben sie unverändert in der Originalsprache wieder. Für Bewertungen bieten wir keinerlei Gegenleistung an.",
  },
  availability: {
    loading: "Kalender wird geladen…",
    unconfigured: "Der Live-Kalender ist noch nicht verbunden.",
    error: "Der Kalender ist derzeit nicht verfügbar.",
    legendUnavailable: "Nicht verfügbar",
    legendSelected: "Ihre Termine",
  },
  booking: {
    eyebrow: "Direkt buchen",
    title: "Buchen",
    subtitle:
      "Wählen Sie Ihre Termine und senden Sie uns eine Anfrage. Keine Online-Zahlung: Wir antworten persönlich per E-Mail, meist innerhalb von ein bis zwei Tagen.",
    promises: ["Keine Kartendaten", "Ohne Vermittler", "Antwort per E-Mail"],
    stepDates: "Termine",
    stepGuests: "Gäste",
    stepDetails: "Ihre Angaben",
    summaryTitle: "Übersicht",
    guestsLabel: "Anzahl der Gäste",
    guestsHint: "Kinder inbegriffen, höchstens {max}",
    nameLabel: "Vor- und Nachname",
    emailLabel: "E-Mail",
    phoneLabel: "Telefon",
    nightsLabel: "Nächte",
    pricePerNightLabel: "Preis pro Nacht",
    cleaningFeeLabel: "Endreinigung",
    totalLabel: "Voraussichtlicher Gesamtpreis",
    minNightsWarning: "Der Mindestaufenthalt beträgt {min} Nächte.",
    noDates: "Noch keine Termine gewählt",
    missingDates: "Bitte wählen Sie zuerst An- und Abreisedatum.",
    quoteNote:
      "Unverbindlicher Kostenvoranschlag: Dies ist keine Buchung und verpflichtet Sie zu nichts. Maßgeblich ist der Preis in unserer Bestätigungs-E-Mail.",
    messageLabel: "Nachricht",
    messagePlaceholder: "Ankunftszeit, Kinder, Fragen…",
    optionalLabel: "optional",
    submitButton: "Anfrage senden",
    sendingLabel: "Wird gesendet…",
    errors: {
      validation_error: "Ungültige Angaben. Bitte prüfen Sie die Felder und versuchen Sie es erneut.",
      invalid_dates: "Die gewählten Termine sind ungültig.",
      min_nights: "Der Mindestaufenthalt wurde nicht eingehalten.",
      dates_unavailable: "Diese Termine sind leider nicht mehr verfügbar.",
      too_soon: "Für dieses Datum ist eine längere Vorlaufzeit nötig.",
      server_error: "Etwas ist schiefgelaufen, bitte versuchen Sie es später erneut.",
    },
  },
  bookingConfirmation: {
    title: "Anfrage erhalten",
    subtitle:
      "Vielen Dank! Wir haben Ihnen eine Zusammenfassung per E-Mail geschickt. Wir antworten meist innerhalb von ein bis zwei Tagen: Bis Sie unsere schriftliche Bestätigung erhalten, sind die Termine noch nicht reserviert.",
    back: "Zurück zum Haus",
  },
  contact: {
    eyebrow: "Kontakt",
    title: "Schreiben Sie uns, *oder rufen Sie an*",
    subtitle: "Francesco antwortet persönlich, auch während Ihres Aufenthalts.",
    hostLabel: "Ihr Gastgeber",
    languagesLabel: "Spricht",
    languages: ["Italienisch", "Englisch", "Französisch"],
    call: "Anrufen",
    write: "E-Mail",
    whereLabel: "Adresse",
    directions: "Route planen",
    formTitle: "Oder hinterlassen Sie eine Nachricht",
    namePlaceholder: "Name",
    emailPlaceholder: "E-Mail",
    arrivalLabel: "Anreise",
    departureLabel: "Abreise",
    messagePlaceholder: "Nachricht",
    send: "Nachricht senden",
    sending: "Wird gesendet…",
    sent: "Nachricht gesendet, vielen Dank! Wir melden uns so bald wie möglich.",
    errorPrefix: "Senden fehlgeschlagen.",
    errorFallbackLink: "Schreiben Sie direkt per E-Mail",
  },
  checkin: {
    eyebrow: "Vor der Anreise",
    title: "Online-Check-in",
    subtitle:
      "Ein paar Minuten jetzt, kein Formular bei der Ankunft. Das italienische Gesetz verpflichtet uns, zu melden, wer im Haus übernachtet: Ihre Daten gehen nur an den Gastgeber.",
    steps: {
      stay: "Aufenthalt",
      primary: "Hauptgast",
      document: "Ausweis",
      guest: "Gast {n}",
      review: "Bestätigen",
    },
    stepIntros: {
      stay: "Wann Sie anreisen und wie viele Sie sind.",
      primary: "Die Angaben der Person, die die Gruppe anmeldet, so wie sie im Ausweis stehen.",
      document: "Dasselbe Dokument, das Sie bei der Ankunft vorzeigen. Nur für den Hauptgast nötig.",
      guest: "Für die anderen Gäste genügen die Personalien, kein Ausweis.",
      review: "Prüfen Sie, ob alles stimmt, und senden Sie dann ab.",
    },
    groups: { identity: "Personalien", birth: "Geburt", residence: "Wohnsitz" },
    stepOf: "Schritt {n} von {total}",
    next: "Weiter",
    back: "Zurück",
    edit: "Ändern",
    arrivalDate: "Anreisedatum",
    nights: "Nächte",
    guestsCount: "Gäste, Kinder inbegriffen",
    groupHint: "Gilt für die ganze Gruppe: wird für die regionale Statistik benötigt.",
    nightsCount: { one: "{n} Nacht", other: "{n} Nächte" },
    guestsTotal: { one: "{n} Gast", other: "{n} Gäste" },
    guest: "Gast",
    primaryGuestLabel: "Hauptgast",
    lastName: "Nachname",
    firstName: "Vorname",
    sex: "Geschlecht",
    male: "Männlich",
    female: "Weiblich",
    birthDate: "Geburtsdatum",
    email: "E-Mail",
    emailPlaceholder: "name@beispiel.de",
    emailHint: "Nur um Sie bei Problemen mit der Anreise zu erreichen.",
    citizenship: "Staatsangehörigkeit",
    citizenshipPlaceholder: "Land suchen (z. B. Deutschland, Österreich…)",
    residenceState: "Wohnsitzland",
    residenceStatePlaceholder: "Land suchen…",
    residencePlace: "Wohnort (Italien)",
    residencePlacePlaceholder: "Italienische Gemeinde suchen (z. B. Rom)…",
    residenceAbroadPlace: "Wohnort",
    residenceAbroadPlacePlaceholder: "z. B. München",
    residenceAddress: "Wohnadresse",
    residenceAddressPlaceholder: "Straße und Hausnummer",
    birthState: "Geburtsland",
    birthStatePlaceholder: "Land suchen…",
    birthPlace: "Geburtsort (Italien)",
    birthPlacePlaceholder: "Italienische Gemeinde suchen (z. B. Mailand)…",
    fiscalCode: "Italienische Steuernummer (Codice fiscale)",
    fiscalCodePlaceholder: "RSSMRA80A01H501U",
    fiscalCodeInvalid: "Ungültige Steuernummer: Sie muss 16 Zeichen haben.",
    documentType: "Art des Dokuments",
    documentTypes: [
      { code: "IDENT", label: "Personalausweis" },
      { code: "PASOR", label: "Reisepass" },
      { code: "PATEN", label: "Führerschein" },
      { code: "ALTRO", label: "Sonstiges" },
    ],
    documentNumber: "Dokumentnummer",
    issueState: "Ausstellungsland",
    issueStatePlaceholder: "Land suchen…",
    issuePlace: "Ausstellungsort (Italien)",
    issuePlacePlaceholder: "Italienische Gemeinde suchen…",
    tourismType: "Reisezweck",
    tourismTypeOptions: [
      { code: "Culturale", label: "Kultur" },
      { code: "Balneare", label: "Badeurlaub" },
      { code: "Congressuale/Affari", label: "Geschäftlich/Kongress" },
      { code: "Fieristico", label: "Messe" },
      { code: "Sportivo/Fitness", label: "Sport/Fitness" },
      { code: "Scolastico", label: "Klassenfahrt" },
      { code: "Religioso", label: "Religiös" },
      { code: "Sociale", label: "Soziales" },
      { code: "Parchi Tematici", label: "Freizeitparks" },
      { code: "Termale/Trattamenti salute", label: "Thermen/Wellness" },
      { code: "Enogastronomico", label: "Essen und Wein" },
      { code: "Cicloturismo", label: "Radfahren" },
      { code: "Escursionistico/Naturalistico", label: "Wandern/Natur" },
      { code: "Altro motivo", label: "Sonstiges" },
      { code: "Non specificato", label: "Keine Angabe" },
    ],
    transportMeans: "Anreise mit",
    transportMeansOptions: [
      { code: "Auto", label: "Auto" },
      { code: "Aereo", label: "Flugzeug" },
      { code: "Aereo+Pullman", label: "Flugzeug + Bus" },
      { code: "Aereo+Navetta/Taxi/Auto", label: "Flugzeug + Shuttle/Taxi/Auto" },
      { code: "Aereo+Treno", label: "Flugzeug + Zug" },
      { code: "Treno", label: "Zug" },
      { code: "Pullman", label: "Reisebus" },
      { code: "Caravan/Autocaravan", label: "Wohnwagen/Wohnmobil" },
      { code: "Barca/Nave/Traghetto", label: "Boot/Schiff/Fähre" },
      { code: "Moto", label: "Motorrad" },
      { code: "Bicicletta", label: "Fahrrad" },
      { code: "A piedi", label: "Zu Fuß" },
      { code: "Altro mezzo", label: "Sonstiges" },
      { code: "Non Specificato", label: "Keine Angabe" },
    ],
    reviewBorn: "Geboren am {date}",
    reviewDocument: "{type} Nr. {number}",
    privacyNotice:
      "Wir benötigen diese Angaben für zwei gesetzlich vorgeschriebene Meldungen: an das Polizeipräsidium (Questura) über das Portal Alloggiati Web (Art. 109 des italienischen Gesetzes über die öffentliche Sicherheit, T.U.L.P.S.) und an die Region Venetien für die Tourismusstatistik (Ross1000). Es handelt sich nicht um eine freiwillige Einwilligung: Ohne diese Angaben können wir Sie nicht beherbergen. Die Daten werden per E-Mail an den Gastgeber übermittelt und nicht auf dem Server der Website gespeichert.",
    submit: "Check-in absenden",
    sending: "Wird gesendet…",
    sentTitle: "Check-in gesendet",
    sentBody:
      "Vielen Dank! Ihre Angaben sind für die vorgeschriebenen Meldungen beim Gastgeber eingegangen. Bei der Ankunft gibt es nichts mehr auszufüllen. Bis bald in Marostica.",
    sentBack: "Zurück zum Haus",
    errorGeneric: "Senden fehlgeschlagen, bitte versuchen Sie es später erneut.",
    errorInvalid: "Einige Angaben fehlen oder sind ungültig: Bitte prüfen Sie die vorherigen Schritte.",
    errorIncompletePlace:
      "Einige Felder wurden nicht aus der Liste gewählt: Bitte prüfen Sie die markierten Felder.",
    selectFromListHint: "Bitte wählen Sie eine Option aus der Liste.",
  },
};

export const dictionaries: Record<Locale, Dictionary> = { it, en, de };

/** Sceglie singolare o plurale e sostituisce {n}. */
export function plural(forms: Plural, n: number): string {
  return (n === 1 ? forms.one : forms.other).replace("{n}", String(n));
}

/** Sostituisce i segnaposto {chiave} di una stringa del dizionario. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}
