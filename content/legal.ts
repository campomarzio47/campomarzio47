import { property } from "@/content/property";

/**
 * Dati legali, identificativi e contrattuali della struttura.
 *
 * È l'equivalente di `content/property.ts` per tutto ciò che ha valore
 * giuridico: identità dell'impresa, codici obbligatori, condizioni di
 * soggiorno, fornitori che trattano dati per conto del titolare.
 *
 * I campi lasciati a stringa vuota NON vengono mostrati: footer e pagine
 * legali li omettono in silenzio, così un ospite non legge mai un
 * segnaposto. Sta all'host compilarli prima di pubblicare — l'elenco
 * completo, con l'indicazione di dove recuperare ogni valore, è in
 * LEGALE.md.
 */

type TouristTax = {
  /** `null` finché non è stato verificato in Comune. */
  applies: boolean | null;
  /** Es. "1,50 € a persona per notte, fino a un massimo di 5 notti". */
  details: string;
};

type Provider = {
  name: string;
  /** A cosa serve, in una riga, per l'elenco nell'informativa privacy. */
  purpose: string;
  purposeEn: string;
  /** Dove risiedono i dati, come va scritto nell'informativa. */
  country: string;
  countryEn: string;
};

export type LegalConfig = {
  business: {
    /** Ragione sociale o denominazione. Vuoto = si usa il nome dell'host. */
    legalName: string;
    vatNumber: string;
    taxCode: string;
    /** Ufficio del registro imprese e numero, es. "Vicenza, REA VI-123456". */
    rea: string;
    registeredOffice: string;
    pec: string;
    email: string;
    phone: string;
  };
  codes: {
    /**
     * Codice Identificativo Nazionale (BDSR). OBBLIGATORIO in ogni annuncio
     * ovunque pubblicato, questo sito compreso: art. 13-ter DL 145/2023.
     * Senza, la sanzione per la mancata indicazione va da 500 a 5.000 €.
     */
    cin: string;
    /** Codice Identificativo Regionale (Veneto), visibile su Ross1000. */
    cir: string;
  };
  stay: {
    /**
     * Ore di anticipo entro cui il saldo deve arrivare: è lo stesso momento
     * in cui viene generato il codice di accesso alla casa. Citato nei
     * Termini, quindi cambiarlo qui cambia anche il contratto.
     */
    paymentDueHoursBeforeArrival: number;
    /** Es. "bonifico bancario". Vuoto = i Termini rimandano all'accordo via email. */
    paymentMethods: string;
    checkInFrom: string;
    checkOutBy: string;
    touristTax: TouristTax;
  };
  /** Fornitori che trattano dati personali per conto del titolare (art. 28 GDPR). */
  providers: {
    hosting: Provider;
    email: Provider;
    mailbox: Provider;
  };
  privacy: {
    /** Data dell'ultima revisione dei testi legali, mostrata in fondo a ogni pagina. */
    lastUpdated: string;
    /** Conservazione, in forma già leggibile, per l'informativa. */
    retentionContact: string;
    retentionContactEn: string;
    retentionBooking: string;
    retentionBookingEn: string;
    retentionCheckin: string;
    retentionCheckinEn: string;
  };
};

export const legal: LegalConfig = {
  business: {
    legalName: "",
    vatNumber: "",
    taxCode: "",
    rea: "",
    registeredOffice: "",
    pec: "",
    email: property.host.email,
    phone: property.host.phone,
  },
  codes: {
    cin: "",
    cir: "",
  },
  stay: {
    paymentDueHoursBeforeArrival: 24,
    paymentMethods: "",
    checkInFrom: "",
    checkOutBy: "",
    touristTax: {
      applies: null,
      details: "",
    },
  },
  providers: {
    hosting: {
      name: "Vercel Inc.",
      purpose: "hosting del sito e log tecnici",
      purposeEn: "website hosting and technical logs",
      country: "Stati Uniti, con server nell'Unione Europea",
      countryEn: "United States, with servers in the European Union",
    },
    email: {
      name: "",
      purpose: "invio delle email generate dal sito",
      purposeEn: "delivery of the emails sent by this website",
      country: "Unione Europea",
      countryEn: "European Union",
    },
    mailbox: {
      name: "",
      purpose: "casella di posta su cui l'host riceve i messaggi",
      purposeEn: "mailbox where the host receives messages",
      country: "",
      countryEn: "",
    },
  },
  privacy: {
    lastUpdated: "2026-09-20",
    retentionContact: "24 mesi dall'ultimo contatto",
    retentionContactEn: "24 months from the last contact",
    retentionBooking:
      "24 mesi dalla richiesta, o per la durata prevista dalla legge se la richiesta diventa un soggiorno",
    retentionBookingEn:
      "24 months from the request, or for the period required by law if the request becomes a stay",
    retentionCheckin:
      "il tempo necessario agli adempimenti di pubblica sicurezza e statistici, e comunque non oltre quanto imposto dalla normativa applicabile",
    retentionCheckinEn:
      "as long as needed for the public-security and statistical obligations, and in any case no longer than the applicable law requires",
  },
};

/** Nome del titolare del trattamento, con ripiego sul nome dell'host. */
export function controllerName(): string {
  return legal.business.legalName || property.host.name;
}

/** Indirizzo del titolare, con ripiego sull'indirizzo dell'immobile. */
export function controllerAddress(): string {
  return legal.business.registeredOffice || property.address.full;
}

/** Il CIN è l'unico codice la cui assenza va segnalata: vedi LEGALE.md. */
export function hasCin(): boolean {
  return legal.codes.cin.trim().length > 0;
}
