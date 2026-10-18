import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Libre_Bodoni, Instrument_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import { LocaleProvider } from "@/components/LocaleProvider";
import { dictionaries } from "@/content/dictionaries";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/locale";
import { property } from "@/content/property";
import { legal } from "@/content/legal";
import { siteUrl, ogImage } from "@/lib/seo";

// Bodoni per i titoli: è un carattere italiano (Giambattista Bodoni,
// Parma). Libre Bodoni e non Bodoni Moda: è disegnato con filetti più
// robusti, e con Bodoni Moda la gamba sinistra della M, la diagonale del 4
// e i tratti sottili del testo grande sparivano, sopra la foto ma anche
// sul chiaro. Instrument Sans per tutto il resto: leggibile a 16 px sui
// telefoni, che sono la maggior parte delle visite.
const bodoni = Libre_Bodoni({
  variable: "--font-bodoni",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
});

const instrument = Instrument_Sans({
  variable: "--font-instrument",
  subsets: ["latin", "latin-ext"],
});

const meta = dictionaries[defaultLocale].meta;

// Codice di verifica della proprietà in Google Search Console (solo la
// stringa dentro content="...", non il tag intero). Se assente, il meta
// tag non viene emesso. Vedi .env.local.example.
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();

// Nessuno script di statistica, di proposito: Google Analytics era l'unico
// terzo a scrivere cookie su questo sito, e la sua presenza avrebbe
// imposto un banner di consenso preventivo (Linee guida cookie del
// Garante). Senza, restano solo cookie tecnici e il banner non serve.
// Se un giorno servissero le statistiche, usare uno strumento che non
// profila e non scrive cookie, oppure rimettere GA INSIEME a un vero
// banner che lo blocchi finché l'utente non accetta.

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: meta.title,
  description: meta.description,
  alternates: { canonical: "/" },
  openGraph: {
    title: meta.title,
    description: meta.description,
    url: "/",
    siteName: property.name,
    images: [ogImage],
    locale: "it_IT",
    alternateLocale: ["en_GB", "de_DE"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: [ogImage.url],
  },
  ...(googleVerification
    ? { verification: { google: googleVerification } }
    : {}),
};

// Dati strutturati (schema.org) per far capire a Google che questa è
// un'attività ricettiva con nome/indirizzo/contatto specifici — aiuta
// per ricerche locali tipo "affitto <nome> <città>". replace(/</...):
// se mai un valore contenesse "<", non deve poter chiudere in anticipo
// il tag <script> che lo racchiude.
// Nessun AggregateRating/Review qui di proposito: le recensioni mostrate
// vengono da Airbnb/Booking, e marcarle come proprie ricade nelle
// "recensioni auto-referenziali" vietate dalle linee guida Google per le
// strutture ricettive (rischio di azione manuale). Restano visibili agli
// utenti, semplicemente non dichiarate nei dati strutturati.
function structuredData() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: dictionaries[defaultLocale].meta.description,
    image: `${siteUrl}${property.heroImage}`,
    url: siteUrl,
    telephone: property.host.phone,
    email: property.host.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address.street,
      addressLocality: property.address.city,
      addressRegion: property.address.province,
      postalCode: property.address.zip,
      addressCountry: "IT",
    },
    // Collega questa pagina alle inserzioni sulle piattaforme: aiuta i
    // motori a capire che sono la stessa struttura.
    sameAs: [property.booking.airbnbUrl, property.booking.bookingUrl].filter(Boolean),
    numberOfRooms: property.facts.bedrooms,
    priceRange: `€${property.pricing.pricePerNight}`,
    currenciesAccepted: property.pricing.currency,
    availableLanguage: property.host.languages,
    // Codice Identificativo Nazionale: schema.org non ha una proprietà
    // dedicata, `identifier` è il contenitore generico previsto per i
    // codici ufficiali. Omesso se non ancora compilato.
    ...(legal.codes.cin ? { identifier: legal.codes.cin } : {}),
  };
  return JSON.stringify(json).replace(/</g, "\\u003c");
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  const initialLocale = isLocale(raw) ? raw : defaultLocale;

  return (
    <html
      lang={initialLocale}
      className={`${bodoni.variable} ${instrument.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-off-white font-sans text-charcoal">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData() }}
        />
        <LocaleProvider initialLocale={initialLocale}>
          <SkipLink />
          {/* Colonna flex: con `flex-1` sul contenuto il footer resta in
              fondo alla finestra anche sulle pagine corte, senza dover
              forzare un'altezza minima che creerebbe scroll inutile. */}
          <div className="flex min-h-dvh flex-col">
            <Header />
            <main id="contenuto" tabIndex={-1} className="flex-1 outline-none">
              {children}
            </main>
            <Footer />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
