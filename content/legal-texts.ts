import { property } from "@/content/property";
import { legal, controllerName, controllerAddress } from "@/content/legal";
// Il nome del cookie arriva da lib/locale.ts e non è scritto a mano: una
// cookie policy che nomina un cookie diverso da quello realmente usato è
// essa stessa un'informazione inesatta.
import { LOCALE_COOKIE, locales, type Locale } from "@/lib/locale";

/**
 * Testi delle tre pagine legali (privacy, cookie, termini), in italiano,
 * inglese e tedesco. In caso di dubbio fa fede la versione italiana: le
 * traduzioni tedesche lo dicono esplicitamente.
 *
 * Stanno qui e non in `content/dictionaries.ts` per una ragione pratica:
 * quello è il dizionario delle stringhe di interfaccia, va letto e
 * modificato spesso, e annegarci dentro qualche centinaio di righe di
 * prosa giuridica lo renderebbe impraticabile.
 *
 * I valori variabili (ragione sociale, P.IVA, CIN, ore di preavviso per il
 * saldo...) sono interpolati da `content/legal.ts`: modificare quel file
 * aggiorna automaticamente questi testi. Dove un dato manca, la frase che
 * lo conterrebbe viene omessa invece di mostrare un vuoto.
 */

export type LegalSection = {
  heading: string;
  paragraphs?: string[];
  items?: string[];
};

export type LegalDocument = {
  intro: string;
  sections: LegalSection[];
};

export type LegalDocuments = {
  privacy: LegalDocument;
  cookies: LegalDocument;
  terms: LegalDocument;
};

/** Scarta le voci vuote: i campi non ancora compilati non devono comparire. */
function compact(items: (string | null | false | undefined)[]): string[] {
  return items.filter((item): item is string => Boolean(item && item.trim()));
}

const hours = legal.stay.paymentDueHoursBeforeArrival;
const maxGuests = property.facts.maxGuests;

// I valori possibili del cookie della lingua, scritti nella policy ("it, en
// oppure de"): derivati da lib/locale.ts per la stessa ragione del nome.
function cookieValues(or: string): string {
  return `${locales.slice(0, -1).join(", ")} ${or} ${locales[locales.length - 1]}`;
}

// ─────────────────────────────── ITALIANO ───────────────────────────────

function privacyIt(): LegalDocument {
  const { business, providers, privacy } = legal;

  return {
    intro:
      "Questa pagina spiega quali dati personali raccogliamo attraverso questo sito, perché lo facciamo, a chi li comunichiamo e quali diritti puoi esercitare. È l'informativa prevista dall'articolo 13 del Regolamento (UE) 2016/679 (GDPR).",
    sections: [
      {
        heading: "Chi tratta i tuoi dati",
        paragraphs: [
          "Il titolare del trattamento è il soggetto che gestisce la locazione turistica presentata su questo sito:",
        ],
        items: compact([
          controllerName(),
          controllerAddress(),
          business.vatNumber && `Partita IVA ${business.vatNumber}`,
          business.taxCode && `Codice fiscale ${business.taxCode}`,
          business.email && `Email: ${business.email}`,
          business.pec && `PEC: ${business.pec}`,
          business.phone && `Telefono: ${business.phone}`,
        ]),
      },
      {
        heading: "Quali dati raccogliamo, e con quale base giuridica",
        paragraphs: [
          "Il sito raccoglie dati solo quando sei tu a compilare uno dei tre moduli. Non c'è profilazione, non c'è pubblicità, non ci sono decisioni automatizzate.",
          "1. Modulo contatti — nome, email, date indicative del soggiorno e il testo del messaggio. Servono a risponderti. La base giuridica è l'esecuzione di misure precontrattuali su tua richiesta e il nostro legittimo interesse a dare seguito a chi ci scrive (art. 6.1.b e 6.1.f GDPR).",
          "2. Richiesta di prenotazione — nome, email, telefono, date, numero di ospiti ed eventuale messaggio. Servono a valutare la disponibilità e risponderti, e, se la richiesta viene confermata, a gestire il soggiorno. La base giuridica è l'esecuzione di misure precontrattuali e poi del contratto (art. 6.1.b GDPR).",
          "3. Check-in online — dati anagrafici di ogni ospite (nome, cognome, sesso, data e luogo di nascita, cittadinanza, residenza) e, per l'ospite che presenta il gruppo, gli estremi del documento di identità, il codice fiscale e l'indirizzo. Questi dati non ce li chiediamo noi: ce li impone la legge. La base giuridica è quindi l'adempimento di un obbligo legale (art. 6.1.c GDPR), e precisamente:",
        ],
        items: [
          "la comunicazione delle persone alloggiate all'autorità di pubblica sicurezza, prevista dall'art. 109 del T.U.L.P.S. ed effettuata tramite il portale Alloggiati Web della Polizia di Stato;",
          "la rilevazione statistica del movimento turistico verso la Regione del Veneto, effettuata tramite il sistema Ross1000/GIES.",
        ],
      },
      {
        heading: "Cosa succede se non fornisci i dati del check-in",
        paragraphs: [
          "Per i moduli contatti e richiesta di prenotazione il conferimento è libero: semplicemente, senza quei dati non possiamo risponderti.",
          "Per il check-in no. Comunicare i dati di ogni persona alloggiata è un obbligo di legge a carico di chi ospita, e senza quei dati non è possibile consentire il soggiorno. Per la stessa ragione non si tratta di un consenso che puoi revocare: quando accetti il modulo di check-in stai dichiarando di aver letto questa informativa, non stai autorizzando un trattamento facoltativo.",
        ],
      },
      {
        heading: "A chi comunichiamo i dati",
        paragraphs: ["I dati raccolti sono comunicati soltanto a:"],
        items: compact([
          "l'autorità di pubblica sicurezza (Questura competente), per i soli dati del check-in;",
          "la Regione del Veneto, per i soli dati statistici del movimento turistico;",
          providers.hosting.name &&
            `${providers.hosting.name} — ${providers.hosting.purpose} (${providers.hosting.country});`,
          providers.email.name &&
            `${providers.email.name} — ${providers.email.purpose} (${providers.email.country});`,
          providers.mailbox.name &&
            `${providers.mailbox.name} — ${providers.mailbox.purpose}${
              providers.mailbox.country ? ` (${providers.mailbox.country})` : ""
            };`,
          "eventuali professionisti (commercialista, consulenti) e autorità, quando la legge lo richiede.",
        ]),
      },
      {
        heading: "Non vendiamo i tuoi dati",
        paragraphs: [
          "I dati non sono ceduti né venduti a terzi per finalità commerciali, non alimentano alcuna attività di marketing e non vengono usati per profilarti.",
        ],
      },
      {
        heading: "Trasferimenti fuori dall'Unione Europea",
        paragraphs: [
          "I fornitori elencati sopra possono trattare i dati anche al di fuori dello Spazio Economico Europeo. In quel caso il trasferimento avviene sulla base di una decisione di adeguatezza della Commissione europea oppure delle clausole contrattuali standard previste dall'art. 46 del GDPR.",
        ],
      },
      {
        heading: "Come sono conservati, e per quanto",
        paragraphs: [
          "Questo sito non ha un database e non archivia i dati dei moduli: ciò che invii viene trasmesso via email al titolare e conservato soltanto nella sua casella di posta e negli archivi necessari agli adempimenti di legge.",
          "I tempi di conservazione sono i seguenti:",
        ],
        items: [
          `Modulo contatti: ${privacy.retentionContact}.`,
          `Richiesta di prenotazione: ${privacy.retentionBooking}.`,
          `Dati del check-in: ${privacy.retentionCheckin}.`,
        ],
      },
      {
        heading: "I tuoi diritti",
        paragraphs: [
          "Puoi chiederci in qualsiasi momento di accedere ai tuoi dati, di correggerli se sono sbagliati, di cancellarli, di limitarne il trattamento, di riceverli in un formato leggibile da un computer, e puoi opporti al trattamento (artt. 15-22 GDPR).",
          "Una precisazione onesta: sui dati che siamo obbligati per legge a comunicare alle autorità, la cancellazione e l'opposizione non possono essere accolte finché l'obbligo persiste. Su tutto il resto sì.",
        ],
        items: compact([
          business.email && `Per esercitare i tuoi diritti scrivi a ${business.email}`,
          business.pec && `oppure via PEC a ${business.pec}.`,
          "Se ritieni che il trattamento violi il GDPR puoi rivolgerti al Garante per la protezione dei dati personali (www.garanteprivacy.it).",
        ]),
      },
      {
        heading: "Aggiornamenti",
        paragraphs: [
          `Questa informativa è aggiornata al ${privacy.lastUpdated}. Se cambieremo il modo in cui trattiamo i dati, aggiorneremo questa pagina.`,
        ],
      },
    ],
  };
}

function cookiesIt(): LegalDocument {
  return {
    intro:
      "I cookie sono piccoli file che un sito salva nel tuo browser. Questo sito ne usa uno solo, e non serve a seguirti.",
    sections: [
      {
        heading: "L'unico cookie che usiamo",
        paragraphs: [
          `Si chiama ${LOCALE_COOKIE}, contiene due lettere (${cookieValues("oppure")}) e serve a ricordare la lingua che hai scelto, così non devi riselezionarla a ogni pagina. Dura dodici mesi e non contiene nulla che permetta di identificarti.`,
        ],
      },
      {
        heading: "Perché non vedi un banner",
        paragraphs: [
          "Perché non serve. Il consenso preventivo è richiesto per i cookie di profilazione e per quelli di terze parti che tracciano la navigazione; i cookie puramente tecnici, come quello della lingua, ne sono esentati dall'art. 122 del Codice privacy e dalle Linee guida del Garante.",
          "Mostrarti un banner per chiederti il permesso di ricordare che leggi in italiano sarebbe soltanto un fastidio inutile.",
        ],
      },
      {
        heading: "Nessun cookie di terze parti",
        paragraphs: [
          "Su questo sito non ci sono strumenti di statistica, non c'è pubblicità, non ci sono pulsanti social, non ci sono mappe incorporate e non ci sono video di terze parti.",
          "Anche i caratteri tipografici sono serviti dal nostro stesso server: il tuo browser non contatta Google per scaricarli, come invece accade sulla maggior parte dei siti.",
        ],
      },
      {
        heading: "Come cancellarlo",
        paragraphs: [
          "Puoi eliminare o bloccare i cookie dalle impostazioni del tuo browser. Se cancelli quello della lingua, il sito tornerà semplicemente a proporti l'italiano.",
        ],
      },
    ],
  };
}

function termsIt(): LegalDocument {
  const { business, codes, stay } = legal;

  const touristTaxLine =
    stay.touristTax.applies === true
      ? `È inoltre dovuta l'imposta di soggiorno: ${
          stay.touristTax.details || "secondo quanto stabilito dal regolamento comunale"
        }. Non è compresa nel prezzo indicato e si versa sul posto.`
      : stay.touristTax.applies === false
        ? "Per questo immobile non è dovuta alcuna imposta di soggiorno: il prezzo indicato è quanto effettivamente pagherai."
        : "Se il Comune applica l'imposta di soggiorno, questa non è compresa nel prezzo indicato e va versata sul posto, secondo quanto stabilito dal regolamento comunale vigente.";

  return {
    intro:
      "Queste condizioni regolano il soggiorno presso l'immobile presentato su questo sito e l'uso del sito stesso. Ti chiediamo di leggerle prima di inviare una richiesta di prenotazione.",
    sections: [
      {
        heading: "Chi siamo",
        paragraphs: ["L'immobile è concesso in locazione turistica da:"],
        items: compact([
          controllerName(),
          controllerAddress(),
          business.vatNumber && `Partita IVA ${business.vatNumber}`,
          business.rea && `Iscrizione al Registro delle imprese: ${business.rea}`,
          business.email && `Email: ${business.email}`,
          business.pec && `PEC: ${business.pec}`,
          codes.cin && `Codice Identificativo Nazionale (CIN): ${codes.cin}`,
          codes.cir && `Codice Identificativo Regionale (CIR): ${codes.cir}`,
        ]),
      },
      {
        heading: "Cosa stai prenotando",
        paragraphs: [
          "Si tratta di una locazione turistica di un'unità abitativa, non di una struttura alberghiera. Non sono forniti servizi alberghieri: non c'è reception, non c'è servizio di pulizia durante il soggiorno, non c'è ristorazione.",
          `L'immobile può ospitare al massimo ${maxGuests} persone. Il numero di ospiti dichiarato nella richiesta non può essere superato.`,
        ],
      },
      {
        heading: "Una richiesta non è ancora una prenotazione",
        paragraphs: [
          "Il modulo presente su questo sito serve a inviarci una richiesta. Non costituisce una prenotazione, non impegna nessuna delle due parti e non comporta alcun pagamento.",
          "Il contratto si perfeziona soltanto quando riceverai da noi una conferma scritta via email. Fino a quel momento le date restano disponibili per altri.",
          "L'importo mostrato sul sito quando scegli le date è un preventivo indicativo, calcolato sulla tariffa corrente. Il prezzo che fa fede è quello scritto nella nostra email di conferma.",
        ],
      },
      {
        heading: "Prezzo e cosa comprende",
        paragraphs: [
          "Il prezzo è indicato per notte e comprende le utenze, la biancheria da letto e gli asciugamani. Eventuali costi aggiuntivi, come le pulizie finali, sono indicati separatamente prima della conferma.",
          touristTaxLine,
        ],
      },
      {
        heading: "Pagamento",
        paragraphs: compact([
          "Non è richiesto alcun anticipo al momento della richiesta, e questo sito non raccoglie dati di pagamento: non ti viene chiesto alcun numero di carta, in nessun momento.",
          `Il saldo dell'intero importo è dovuto entro ${hours} ore prima dell'arrivo. È lo stesso momento in cui generiamo e ti inviamo il codice di accesso alla casa.`,
          stay.paymentMethods && `Mezzi di pagamento accettati: ${stay.paymentMethods}.`,
          !stay.paymentMethods &&
            "I mezzi di pagamento accettati ti verranno indicati nell'email di conferma.",
          "Se il saldo non perviene entro il termine, la prenotazione si intende annullata e l'accesso all'immobile non viene consentito.",
        ]),
      },
      {
        heading: "Cancellazione",
        paragraphs: [
          "Puoi annullare la prenotazione senza alcuna penale, e senza doverci spiegare il motivo, in qualsiasi momento prima del versamento del saldo. Non essendoci anticipi, non c'è nulla da rimborsare e nulla da trattenere.",
          `Dopo il versamento del saldo — quindi nelle ultime ${hours} ore prima dell'arrivo — l'importo non è più rimborsabile, salvo diverso accordo scritto tra le parti.`,
        ],
      },
      {
        heading: "Diritto di recesso",
        paragraphs: [
          "Il diritto di recesso di quattordici giorni previsto per gli acquisti a distanza non si applica a questa prenotazione.",
          "Lo stabilisce l'art. 59, comma 1, lettera n) del Codice del consumo, che esclude il recesso per i contratti di fornitura di alloggi per fini non residenziali quando il contratto prevede una data o un periodo di esecuzione specifici. È il caso di un soggiorno prenotato per date determinate: chi ospita, tenendo quelle date bloccate, rinuncia alla possibilità di affittarle ad altri.",
          "Resta ferma la politica di cancellazione descritta sopra, che nei fatti ti lascia libero di annullare senza costi fino al saldo.",
        ],
      },
      {
        heading: "I tuoi obblighi come ospite",
        items: [
          "Fornire i dati di tutte le persone alloggiate prima dell'arrivo o al momento dell'arrivo: è un obbligo di legge a nostro carico, e senza quei dati non possiamo consentire il soggiorno.",
          `Non superare il numero massimo di ${maxGuests} ospiti e non ospitare persone non dichiarate.`,
          "Non cedere a terzi, a nessun titolo, l'immobile o il codice di accesso.",
          "Non organizzare feste o eventi e rispettare la quiete del vicinato.",
          "Usare l'immobile con la dovuta diligenza e segnalarci tempestivamente guasti o danni.",
        ],
      },
      {
        heading: "Danni e responsabilità",
        paragraphs: [
          "Sei responsabile dei danni causati all'immobile e agli arredi da te o dalle persone che ospiti, secondo le regole ordinarie del codice civile.",
          "Da parte nostra rispondiamo nei limiti previsti dalla legge. Non rispondiamo di eventi che non dipendono da noi, come interruzioni di energia elettrica, acqua o connessione internet imputabili ai fornitori, né dei beni personali lasciati incustoditi.",
        ],
      },
      {
        heading: "Reclami, legge applicabile e foro competente",
        paragraphs: compact([
          business.email &&
            `Se qualcosa non va, scrivici a ${business.email}${
              business.pec ? ` o via PEC a ${business.pec}` : ""
            }: cerchiamo sempre una soluzione prima di ogni altra cosa.`,
          "Il contratto è regolato dalla legge italiana. Se sei un consumatore, resta competente in via esclusiva il giudice del luogo in cui risiedi o hai eletto domicilio, e restano salve le tutele inderogabili previste dal Codice del consumo.",
        ]),
      },
      {
        heading: "Aggiornamenti",
        paragraphs: [
          `Queste condizioni sono aggiornate al ${legal.privacy.lastUpdated}. Al soggiorno si applicano le condizioni in vigore al momento della conferma della prenotazione.`,
        ],
      },
    ],
  };
}

// ──────────────────────────────── ENGLISH ────────────────────────────────

function privacyEn(): LegalDocument {
  const { business, providers, privacy } = legal;

  return {
    intro:
      "This page explains what personal data we collect through this website, why, who we share it with, and what rights you can exercise. It is the notice required by Article 13 of Regulation (EU) 2016/679 (GDPR).",
    sections: [
      {
        heading: "Who processes your data",
        paragraphs: [
          "The data controller is the party operating the holiday rental presented on this website:",
        ],
        items: compact([
          controllerName(),
          controllerAddress(),
          business.vatNumber && `Italian VAT number ${business.vatNumber}`,
          business.taxCode && `Italian tax code ${business.taxCode}`,
          business.email && `Email: ${business.email}`,
          business.pec && `Certified email (PEC): ${business.pec}`,
          business.phone && `Phone: ${business.phone}`,
        ]),
      },
      {
        heading: "What we collect, and on what legal basis",
        paragraphs: [
          "The website only collects data when you fill in one of the three forms. There is no profiling, no advertising and no automated decision-making.",
          "1. Contact form — name, email, indicative dates and your message. Used to reply to you. The legal basis is pre-contractual measures taken at your request and our legitimate interest in answering people who write to us (Art. 6.1.b and 6.1.f GDPR).",
          "2. Booking request — name, email, phone, dates, number of guests and any message. Used to check availability and reply, and, if the request is confirmed, to manage your stay. The legal basis is pre-contractual measures and then performance of the contract (Art. 6.1.b GDPR).",
          "3. Online check-in — personal details of every guest (name, surname, sex, date and place of birth, citizenship, residence) and, for the guest registering the group, identity document details, Italian tax code and address. We are not the ones asking for this: the law is. The legal basis is therefore compliance with a legal obligation (Art. 6.1.c GDPR), specifically:",
        ],
        items: [
          "reporting accommodated persons to the public security authority, required by Art. 109 of the Italian Consolidated Public Security Act and carried out through the State Police portal Alloggiati Web;",
          "statistical reporting of tourist movement to the Veneto Region, carried out through the Ross1000/GIES system.",
        ],
      },
      {
        heading: "What happens if you do not provide the check-in data",
        paragraphs: [
          "For the contact and booking request forms, providing data is entirely up to you: without it, we simply cannot reply.",
          "For the check-in it is different. Reporting the details of every accommodated person is a legal obligation on the host, and without that data the stay cannot go ahead. For the same reason this is not a consent you can withdraw: when you tick the check-in box you are confirming you have read this notice, not authorising an optional processing.",
        ],
      },
      {
        heading: "Who we share data with",
        paragraphs: ["The data collected is shared only with:"],
        items: compact([
          "the public security authority (the competent Questura), for check-in data only;",
          "the Veneto Region, for tourist-movement statistics only;",
          providers.hosting.name &&
            `${providers.hosting.name} — ${providers.hosting.purposeEn} (${providers.hosting.countryEn});`,
          providers.email.name &&
            `${providers.email.name} — ${providers.email.purposeEn} (${providers.email.countryEn});`,
          providers.mailbox.name &&
            `${providers.mailbox.name} — ${providers.mailbox.purposeEn}${
              providers.mailbox.countryEn ? ` (${providers.mailbox.countryEn})` : ""
            };`,
          "professional advisers and authorities, where the law requires it.",
        ]),
      },
      {
        heading: "We do not sell your data",
        paragraphs: [
          "Your data is never sold or disclosed to third parties for commercial purposes, never feeds any marketing activity and is never used to profile you.",
        ],
      },
      {
        heading: "Transfers outside the European Union",
        paragraphs: [
          "The providers listed above may process data outside the European Economic Area. Where that happens, the transfer relies on an adequacy decision of the European Commission or on the standard contractual clauses under Art. 46 GDPR.",
        ],
      },
      {
        heading: "How it is stored, and for how long",
        paragraphs: [
          "This website has no database and does not store form submissions: what you send is emailed to the controller and kept only in their mailbox and in the records required by law.",
          "Retention periods are:",
        ],
        items: [
          `Contact form: ${privacy.retentionContactEn}.`,
          `Booking request: ${privacy.retentionBookingEn}.`,
          `Check-in data: ${privacy.retentionCheckinEn}.`,
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "At any time you can ask us to access your data, correct it if wrong, erase it, restrict its processing, receive it in a machine-readable format, and you can object to processing (Arts. 15-22 GDPR).",
          "One honest caveat: for data we are legally required to report to the authorities, erasure and objection cannot be granted while that obligation stands. For everything else, they can.",
        ],
        items: compact([
          business.email && `To exercise your rights, write to ${business.email}`,
          business.pec && `or by certified email to ${business.pec}.`,
          "If you believe the processing breaches the GDPR you may lodge a complaint with the Italian Data Protection Authority (www.garanteprivacy.it) or your local supervisory authority.",
        ]),
      },
      {
        heading: "Updates",
        paragraphs: [
          `This notice was last updated on ${privacy.lastUpdated}. If we change how we handle data, we will update this page.`,
        ],
      },
    ],
  };
}

function cookiesEn(): LegalDocument {
  return {
    intro:
      "Cookies are small files a website stores in your browser. This site uses exactly one, and it is not there to track you.",
    sections: [
      {
        heading: "The only cookie we use",
        paragraphs: [
          `It is called ${LOCALE_COOKIE}, it holds two letters (${cookieValues("or")}), and it remembers the language you picked so you do not have to choose it again on every page. It lasts twelve months and contains nothing that could identify you.`,
        ],
      },
      {
        heading: "Why there is no banner",
        paragraphs: [
          "Because none is needed. Prior consent is required for profiling cookies and for third-party cookies that track browsing; purely technical cookies, such as a language preference, are exempt under Art. 122 of the Italian Privacy Code and the Data Protection Authority's guidelines.",
          "Showing you a banner to ask permission to remember that you read in English would be pure friction.",
        ],
      },
      {
        heading: "No third-party cookies",
        paragraphs: [
          "This website has no analytics, no advertising, no social buttons, no embedded maps and no third-party video.",
          "Even the fonts are served from our own server: your browser never contacts Google to download them, unlike on most websites.",
        ],
      },
      {
        heading: "How to delete it",
        paragraphs: [
          "You can delete or block cookies in your browser settings. If you delete the language one, the site will simply go back to offering Italian.",
        ],
      },
    ],
  };
}

function termsEn(): LegalDocument {
  const { business, codes, stay } = legal;

  const touristTaxLine =
    stay.touristTax.applies === true
      ? `A tourist tax also applies: ${
          stay.touristTax.details || "as set by the municipal regulation"
        }. It is not included in the price shown and is paid on site.`
      : stay.touristTax.applies === false
        ? "No tourist tax is due for this property: the price shown is what you actually pay."
        : "If the municipality applies a tourist tax, it is not included in the price shown and is paid on site, as set by the municipal regulation in force.";

  return {
    intro:
      "These terms govern your stay at the property presented on this website and your use of the website itself. Please read them before sending a booking request.",
    sections: [
      {
        heading: "Who we are",
        paragraphs: ["The property is let as a holiday rental by:"],
        items: compact([
          controllerName(),
          controllerAddress(),
          business.vatNumber && `Italian VAT number ${business.vatNumber}`,
          business.rea && `Companies Register entry: ${business.rea}`,
          business.email && `Email: ${business.email}`,
          business.pec && `Certified email (PEC): ${business.pec}`,
          codes.cin && `National Identification Code (CIN): ${codes.cin}`,
          codes.cir && `Regional Identification Code (CIR): ${codes.cir}`,
        ]),
      },
      {
        heading: "What you are booking",
        paragraphs: [
          "This is a holiday rental of a private home, not a hotel. No hotel services are provided: there is no reception, no housekeeping during your stay and no catering.",
          `The property sleeps a maximum of ${maxGuests} people. The number of guests stated in the request may not be exceeded.`,
        ],
      },
      {
        heading: "A request is not yet a booking",
        paragraphs: [
          "The form on this website sends us a request. It is not a booking, it binds neither party and it involves no payment.",
          "The contract is formed only when you receive a written confirmation from us by email. Until then the dates remain available to others.",
          "The amount shown on the website when you pick your dates is an indicative quote based on the current rate. The price that counts is the one written in our confirmation email.",
        ],
      },
      {
        heading: "Price and what it covers",
        paragraphs: [
          "The price is quoted per night and includes utilities, bed linen and towels. Any additional costs, such as a final cleaning fee, are stated separately before confirmation.",
          touristTaxLine,
        ],
      },
      {
        heading: "Payment",
        paragraphs: compact([
          "No deposit is required when you send a request, and this website collects no payment details: you are never asked for a card number, at any point.",
          `The full amount is due no later than ${hours} hours before arrival. That is the same moment we generate and send you the access code to the house.`,
          stay.paymentMethods && `Accepted payment methods: ${stay.paymentMethods}.`,
          !stay.paymentMethods &&
            "Accepted payment methods will be set out in our confirmation email.",
          "If payment is not received by the deadline, the booking is treated as cancelled and access to the property is not granted.",
        ]),
      },
      {
        heading: "Cancellation",
        paragraphs: [
          "You may cancel free of charge, without giving a reason, at any time before paying the balance. Since nothing is paid up front, there is nothing to refund and nothing to withhold.",
          `After the balance has been paid — that is, within the last ${hours} hours before arrival — the amount is no longer refundable, unless the parties agree otherwise in writing.`,
        ],
      },
      {
        heading: "Right of withdrawal",
        paragraphs: [
          "The fourteen-day right of withdrawal that applies to distance purchases does not apply to this booking.",
          "This follows from Art. 59(1)(n) of the Italian Consumer Code, which excludes withdrawal for contracts providing accommodation for non-residential purposes where the contract specifies a particular date or period of performance. A stay booked for specific dates is exactly that: by holding those dates for you, the host gives up the chance to let them to anyone else.",
          "The cancellation policy above still applies, and in practice leaves you free to cancel at no cost right up to payment.",
        ],
      },
      {
        heading: "Your obligations as a guest",
        items: [
          "Provide the details of every person staying, before or on arrival: this is a legal obligation on us, and without that data we cannot allow the stay.",
          `Do not exceed the maximum of ${maxGuests} guests and do not host undeclared people.`,
          "Do not pass the property or the access code on to anyone else, on any basis.",
          "Do not hold parties or events, and respect the neighbours' peace and quiet.",
          "Treat the property with proper care and tell us promptly about faults or damage.",
        ],
      },
      {
        heading: "Damage and liability",
        paragraphs: [
          "You are liable for damage caused to the property and its contents by you or by the people you host, under the ordinary rules of Italian civil law.",
          "On our side, we are liable within the limits set by law. We are not liable for events outside our control, such as interruptions to electricity, water or internet attributable to the utility providers, nor for personal belongings left unattended.",
        ],
      },
      {
        heading: "Complaints, governing law and jurisdiction",
        paragraphs: compact([
          business.email &&
            `If something is wrong, write to us at ${business.email}${
              business.pec ? ` or by certified email to ${business.pec}` : ""
            }: we always look for a solution first.`,
          "The contract is governed by Italian law. If you are a consumer, the courts of the place where you reside or have elected domicile have exclusive jurisdiction, and the mandatory protections of the Italian Consumer Code continue to apply.",
        ]),
      },
      {
        heading: "Updates",
        paragraphs: [
          `These terms were last updated on ${legal.privacy.lastUpdated}. The terms in force when your booking is confirmed are the ones that apply to your stay.`,
        ],
      },
    ],
  };
}

// ──────────────────────────────── DEUTSCH ────────────────────────────────

function privacyDe(): LegalDocument {
  const { business, providers, privacy } = legal;

  return {
    intro:
      "Diese Seite erklärt, welche personenbezogenen Daten wir über diese Website erheben, warum, an wen wir sie weitergeben und welche Rechte Sie haben. Es handelt sich um die Information nach Artikel 13 der Verordnung (EU) 2016/679 (DSGVO).",
    sections: [
      {
        heading: "Wer Ihre Daten verarbeitet",
        paragraphs: [
          "Verantwortlicher ist, wer die auf dieser Website vorgestellte Ferienunterkunft betreibt:",
        ],
        items: compact([
          controllerName(),
          controllerAddress(),
          business.vatNumber && `Italienische USt-IdNr. ${business.vatNumber}`,
          business.taxCode && `Italienische Steuernummer ${business.taxCode}`,
          business.email && `E-Mail: ${business.email}`,
          business.pec && `Zertifizierte E-Mail (PEC): ${business.pec}`,
          business.phone && `Telefon: ${business.phone}`,
        ]),
      },
      {
        heading: "Welche Daten wir erheben, und auf welcher Rechtsgrundlage",
        paragraphs: [
          "Die Website erhebt nur dann Daten, wenn Sie eines der drei Formulare ausfüllen. Es gibt kein Profiling, keine Werbung und keine automatisierten Entscheidungen.",
          "1. Kontaktformular — Name, E-Mail, ungefähre Reisedaten und Ihre Nachricht. Sie dienen dazu, Ihnen zu antworten. Rechtsgrundlage sind vorvertragliche Maßnahmen auf Ihre Anfrage und unser berechtigtes Interesse, auf Nachrichten zu antworten (Art. 6 Abs. 1 lit. b und f DSGVO).",
          "2. Buchungsanfrage — Name, E-Mail, Telefon, Reisedaten, Anzahl der Gäste und eine eventuelle Nachricht. Sie dienen dazu, die Verfügbarkeit zu prüfen und Ihnen zu antworten und, wenn die Anfrage bestätigt wird, den Aufenthalt abzuwickeln. Rechtsgrundlage sind vorvertragliche Maßnahmen und anschließend die Erfüllung des Vertrags (Art. 6 Abs. 1 lit. b DSGVO).",
          "3. Online-Check-in — Personalien jedes Gastes (Vor- und Nachname, Geschlecht, Geburtsdatum und -ort, Staatsangehörigkeit, Wohnsitz) und, für die Person, die die Gruppe anmeldet, die Angaben zum Ausweisdokument, die italienische Steuernummer und die Adresse. Diese Daten verlangen nicht wir, sondern das Gesetz. Rechtsgrundlage ist daher die Erfüllung einer rechtlichen Verpflichtung (Art. 6 Abs. 1 lit. c DSGVO), und zwar:",
        ],
        items: [
          "die Meldung der beherbergten Personen an die Behörde für öffentliche Sicherheit nach Art. 109 des italienischen Gesetzes über die öffentliche Sicherheit (T.U.L.P.S.), über das Portal Alloggiati Web der Staatspolizei;",
          "die statistische Erfassung des Tourismus für die Region Venetien über das System Ross1000/GIES.",
        ],
      },
      {
        heading: "Was geschieht, wenn Sie die Check-in-Daten nicht angeben",
        paragraphs: [
          "Beim Kontaktformular und bei der Buchungsanfrage ist die Angabe freiwillig: Ohne diese Daten können wir Ihnen lediglich nicht antworten.",
          "Beim Check-in nicht. Die Meldung jeder beherbergten Person ist eine gesetzliche Pflicht des Gastgebers, und ohne diese Daten kann der Aufenthalt nicht stattfinden. Aus demselben Grund handelt es sich nicht um eine Einwilligung, die Sie widerrufen könnten: Mit dem Häkchen im Check-in bestätigen Sie, diese Information gelesen zu haben, Sie erlauben keine freiwillige Verarbeitung.",
        ],
      },
      {
        heading: "An wen wir Daten weitergeben",
        paragraphs: ["Die erhobenen Daten werden nur weitergegeben an:"],
        items: compact([
          "die Behörde für öffentliche Sicherheit (die zuständige Questura), nur die Check-in-Daten;",
          "die Region Venetien, nur die statistischen Daten zum Tourismus;",
          providers.hosting.name &&
            `${providers.hosting.name} — ${providers.hosting.purposeDe} (${providers.hosting.countryDe});`,
          providers.email.name &&
            `${providers.email.name} — ${providers.email.purposeDe} (${providers.email.countryDe});`,
          providers.mailbox.name &&
            `${providers.mailbox.name} — ${providers.mailbox.purposeDe}${
              providers.mailbox.countryDe ? ` (${providers.mailbox.countryDe})` : ""
            };`,
          "Berater (etwa Steuerberater) und Behörden, wenn das Gesetz es verlangt.",
        ]),
      },
      {
        heading: "Wir verkaufen Ihre Daten nicht",
        paragraphs: [
          "Ihre Daten werden weder verkauft noch zu kommerziellen Zwecken an Dritte weitergegeben, sie fließen in keinerlei Marketing ein und werden nicht für Profiling verwendet.",
        ],
      },
      {
        heading: "Übermittlung außerhalb der Europäischen Union",
        paragraphs: [
          "Die oben genannten Dienstleister können Daten auch außerhalb des Europäischen Wirtschaftsraums verarbeiten. In diesem Fall stützt sich die Übermittlung auf einen Angemessenheitsbeschluss der Europäischen Kommission oder auf die Standardvertragsklauseln nach Art. 46 DSGVO.",
        ],
      },
      {
        heading: "Wie und wie lange die Daten gespeichert werden",
        paragraphs: [
          "Diese Website hat keine Datenbank und speichert die Formulardaten nicht: Was Sie senden, wird per E-Mail an den Verantwortlichen übermittelt und nur in dessen Postfach und in den gesetzlich vorgeschriebenen Unterlagen aufbewahrt.",
          "Die Speicherdauer beträgt:",
        ],
        items: [
          `Kontaktformular: ${privacy.retentionContactDe}.`,
          `Buchungsanfrage: ${privacy.retentionBookingDe}.`,
          `Check-in-Daten: ${privacy.retentionCheckinDe}.`,
        ],
      },
      {
        heading: "Ihre Rechte",
        paragraphs: [
          "Sie können jederzeit Auskunft über Ihre Daten verlangen, sie berichtigen lassen, wenn sie falsch sind, ihre Löschung oder die Einschränkung der Verarbeitung verlangen, sie in einem maschinenlesbaren Format erhalten und der Verarbeitung widersprechen (Art. 15–22 DSGVO).",
          "Eine ehrliche Einschränkung: Bei Daten, die wir gesetzlich an Behörden melden müssen, können Löschung und Widerspruch nicht gewährt werden, solange diese Pflicht besteht. Bei allem anderen schon.",
        ],
        items: compact([
          business.email && `Um Ihre Rechte auszuüben, schreiben Sie an ${business.email}`,
          business.pec && `oder per zertifizierter E-Mail an ${business.pec}.`,
          "Wenn Sie der Meinung sind, dass die Verarbeitung gegen die DSGVO verstößt, können Sie sich bei der italienischen Datenschutzbehörde (www.garanteprivacy.it) oder bei der Aufsichtsbehörde Ihres Landes beschweren.",
        ]),
      },
      {
        heading: "Aktualisierungen",
        paragraphs: [
          `Diese Information wurde zuletzt am ${privacy.lastUpdated} aktualisiert. Wenn wir die Art der Datenverarbeitung ändern, aktualisieren wir diese Seite.`,
          "Dies ist eine Übersetzung aus dem Italienischen; im Zweifel gilt die italienische Fassung.",
        ],
      },
    ],
  };
}

function cookiesDe(): LegalDocument {
  return {
    intro:
      "Cookies sind kleine Dateien, die eine Website in Ihrem Browser speichert. Diese Website verwendet genau eines, und es dient nicht dazu, Sie zu verfolgen.",
    sections: [
      {
        heading: "Das einzige Cookie, das wir verwenden",
        paragraphs: [
          `Es heißt ${LOCALE_COOKIE}, enthält zwei Buchstaben (${cookieValues("oder")}) und merkt sich die Sprache, die Sie gewählt haben, damit Sie sie nicht auf jeder Seite neu auswählen müssen. Es ist zwölf Monate gültig und enthält nichts, was Sie identifizieren könnte.`,
        ],
      },
      {
        heading: "Warum Sie kein Banner sehen",
        paragraphs: [
          "Weil keines nötig ist. Eine vorherige Einwilligung ist für Profiling-Cookies und für Cookies von Dritten erforderlich, die das Surfverhalten verfolgen; rein technische Cookies wie die Sprachwahl sind nach Art. 122 des italienischen Datenschutzgesetzes und den Leitlinien der Datenschutzbehörde davon ausgenommen.",
          "Ihnen ein Banner zu zeigen, um zu fragen, ob wir uns merken dürfen, dass Sie auf Deutsch lesen, wäre nur ein unnötiges Hindernis.",
        ],
      },
      {
        heading: "Keine Cookies von Dritten",
        paragraphs: [
          "Auf dieser Website gibt es keine Statistik-Tools, keine Werbung, keine Social-Media-Buttons, keine eingebetteten Karten und keine Videos von Dritten.",
          "Auch die Schriften werden von unserem eigenen Server ausgeliefert: Ihr Browser kontaktiert dafür nicht Google, wie es auf den meisten Websites geschieht.",
        ],
      },
      {
        heading: "Wie Sie es löschen",
        paragraphs: [
          "Sie können Cookies in den Einstellungen Ihres Browsers löschen oder blockieren. Wenn Sie das Sprach-Cookie löschen, zeigt die Website wieder Italienisch an.",
        ],
      },
    ],
  };
}

function termsDe(): LegalDocument {
  const { business, codes, stay } = legal;

  const touristTaxLine =
    stay.touristTax.applies === true
      ? `Zusätzlich fällt eine Kurtaxe an: ${
          stay.touristTax.details || "gemäß der Satzung der Gemeinde"
        }. Sie ist im angegebenen Preis nicht enthalten und wird vor Ort bezahlt.`
      : stay.touristTax.applies === false
        ? "Für diese Unterkunft fällt keine Kurtaxe an: Der angegebene Preis ist das, was Sie tatsächlich bezahlen."
        : "Erhebt die Gemeinde eine Kurtaxe, ist sie im angegebenen Preis nicht enthalten und wird vor Ort gemäß der geltenden Satzung bezahlt.";

  return {
    intro:
      "Diese Bedingungen regeln Ihren Aufenthalt in der auf dieser Website vorgestellten Unterkunft und die Nutzung der Website selbst. Bitte lesen Sie sie, bevor Sie eine Buchungsanfrage senden. Dies ist eine Übersetzung aus dem Italienischen; im Zweifel gilt die italienische Fassung.",
    sections: [
      {
        heading: "Wer wir sind",
        paragraphs: ["Die Unterkunft wird als Ferienunterkunft vermietet von:"],
        items: compact([
          controllerName(),
          controllerAddress(),
          business.vatNumber && `Italienische USt-IdNr. ${business.vatNumber}`,
          business.rea && `Handelsregister: ${business.rea}`,
          business.email && `E-Mail: ${business.email}`,
          business.pec && `Zertifizierte E-Mail (PEC): ${business.pec}`,
          codes.cin && `Nationaler Identifikationscode (CIN): ${codes.cin}`,
          codes.cir && `Regionaler Identifikationscode (CIR): ${codes.cir}`,
        ]),
      },
      {
        heading: "Was Sie buchen",
        paragraphs: [
          "Es handelt sich um die touristische Vermietung einer Wohneinheit, nicht um einen Hotelbetrieb. Hoteldienstleistungen werden nicht erbracht: keine Rezeption, keine Reinigung während des Aufenthalts, keine Verpflegung.",
          `Die Unterkunft bietet Platz für höchstens ${maxGuests} Personen. Die in der Anfrage angegebene Zahl der Gäste darf nicht überschritten werden.`,
        ],
      },
      {
        heading: "Eine Anfrage ist noch keine Buchung",
        paragraphs: [
          "Mit dem Formular auf dieser Website senden Sie uns eine Anfrage. Sie ist keine Buchung, verpflichtet keine der beiden Seiten und ist mit keiner Zahlung verbunden.",
          "Der Vertrag kommt erst zustande, wenn Sie von uns eine schriftliche Bestätigung per E-Mail erhalten. Bis dahin bleiben die Termine für andere verfügbar.",
          "Der Betrag, den die Website bei der Wahl der Termine anzeigt, ist ein unverbindlicher Kostenvoranschlag auf Grundlage des aktuellen Preises. Maßgeblich ist der Preis in unserer Bestätigungs-E-Mail.",
        ],
      },
      {
        heading: "Preis und Leistungen",
        paragraphs: [
          "Der Preis gilt pro Nacht und umfasst Nebenkosten, Bettwäsche und Handtücher. Eventuelle Zusatzkosten, etwa eine Endreinigung, werden vor der Bestätigung gesondert angegeben.",
          touristTaxLine,
        ],
      },
      {
        heading: "Zahlung",
        paragraphs: compact([
          "Bei der Anfrage ist keine Anzahlung zu leisten, und diese Website erhebt keine Zahlungsdaten: Sie werden zu keinem Zeitpunkt nach einer Kartennummer gefragt.",
          `Der gesamte Betrag ist spätestens ${hours} Stunden vor der Anreise fällig. Zum selben Zeitpunkt erzeugen wir den Zugangscode für das Haus und senden ihn Ihnen.`,
          stay.paymentMethods && `Akzeptierte Zahlungsmittel: ${stay.paymentMethods}.`,
          !stay.paymentMethods &&
            "Die akzeptierten Zahlungsmittel teilen wir Ihnen in der Bestätigungs-E-Mail mit.",
          "Geht die Zahlung nicht fristgerecht ein, gilt die Buchung als storniert und der Zugang zur Unterkunft wird nicht gewährt.",
        ]),
      },
      {
        heading: "Stornierung",
        paragraphs: [
          "Sie können jederzeit vor der Zahlung des Betrags kostenlos und ohne Angabe von Gründen stornieren. Da nichts im Voraus bezahlt wird, gibt es nichts zu erstatten und nichts einzubehalten.",
          `Nach der Zahlung — also in den letzten ${hours} Stunden vor der Anreise — wird der Betrag nicht mehr erstattet, sofern die Parteien nicht schriftlich etwas anderes vereinbaren.`,
        ],
      },
      {
        heading: "Widerrufsrecht",
        paragraphs: [
          "Das vierzehntägige Widerrufsrecht für Fernabsatzverträge gilt für diese Buchung nicht.",
          "Das ergibt sich aus Art. 59 Abs. 1 Buchst. n des italienischen Verbrauchergesetzbuchs, der den Widerruf bei Verträgen über die Bereitstellung von Unterkünften zu anderen als Wohnzwecken ausschließt, wenn der Vertrag einen bestimmten Zeitpunkt oder Zeitraum vorsieht. Genau das ist ein für feste Termine gebuchter Aufenthalt: Wer die Termine für Sie freihält, verzichtet darauf, sie anderen zu vermieten.",
          "Die oben beschriebenen Stornierungsbedingungen gelten weiterhin und lassen Ihnen in der Praxis bis zur Zahlung die Freiheit, kostenlos zu stornieren.",
        ],
      },
      {
        heading: "Ihre Pflichten als Gast",
        items: [
          "Die Angaben aller beherbergten Personen vor oder bei der Ankunft mitteilen: Das ist eine gesetzliche Pflicht für uns, und ohne diese Angaben können wir den Aufenthalt nicht gestatten.",
          `Die Höchstzahl von ${maxGuests} Gästen nicht überschreiten und keine nicht angemeldeten Personen beherbergen.`,
          "Die Unterkunft oder den Zugangscode in keiner Form an Dritte weitergeben.",
          "Keine Feste oder Veranstaltungen ausrichten und die Ruhe der Nachbarschaft respektieren.",
          "Die Unterkunft mit der gebotenen Sorgfalt nutzen und uns Defekte oder Schäden umgehend melden.",
        ],
      },
      {
        heading: "Schäden und Haftung",
        paragraphs: [
          "Sie haften nach den allgemeinen Regeln des italienischen Zivilrechts für Schäden an der Unterkunft und der Einrichtung, die Sie oder die von Ihnen beherbergten Personen verursachen.",
          "Wir haften unsererseits im gesetzlichen Rahmen. Wir haften nicht für Ereignisse, die wir nicht beeinflussen können, etwa Unterbrechungen von Strom, Wasser oder Internet durch die Versorger, und nicht für unbeaufsichtigt gelassene persönliche Gegenstände.",
        ],
      },
      {
        heading: "Beschwerden, anwendbares Recht und Gerichtsstand",
        paragraphs: compact([
          business.email &&
            `Wenn etwas nicht stimmt, schreiben Sie uns an ${business.email}${
              business.pec ? ` oder per zertifizierter E-Mail an ${business.pec}` : ""
            }: Wir suchen immer zuerst nach einer Lösung.`,
          "Der Vertrag unterliegt italienischem Recht. Sind Sie Verbraucher, ist ausschließlich das Gericht Ihres Wohnsitzes oder gewählten Wohnsitzes zuständig, und die zwingenden Schutzvorschriften des italienischen Verbrauchergesetzbuchs bleiben unberührt.",
        ]),
      },
      {
        heading: "Aktualisierungen",
        paragraphs: [
          `Diese Bedingungen wurden zuletzt am ${legal.privacy.lastUpdated} aktualisiert. Für Ihren Aufenthalt gelten die Bedingungen, die bei der Bestätigung der Buchung in Kraft sind.`,
        ],
      },
    ],
  };
}

export const legalTexts: Record<Locale, LegalDocuments> = {
  it: { privacy: privacyIt(), cookies: cookiesIt(), terms: termsIt() },
  en: { privacy: privacyEn(), cookies: cookiesEn(), terms: termsEn() },
  de: { privacy: privacyDe(), cookies: cookiesDe(), terms: termsDe() },
};
