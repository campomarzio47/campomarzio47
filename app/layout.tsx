import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CheckInFab from "@/components/CheckInFab";
import Footer from "@/components/Footer";
import SkipLink from "@/components/SkipLink";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LocaleProvider } from "@/components/LocaleProvider";
import { dictionaries } from "@/content/dictionaries";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/locale";
import { property } from "@/content/property";
import { legal } from "@/content/legal";
import { siteUrl, ogImage } from "@/lib/seo";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
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
      className={`${cormorant.variable} ${dmSans.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-off-white text-charcoal font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: structuredData() }}
        />
        <LocaleProvider initialLocale={initialLocale}>
          <SkipLink />
          {/* Colonna flex: con `flex-1` sul contenuto il footer resta in
              fondo alla finestra anche sulle pagine corte, senza dover
              forzare un'altezza minima che creerebbe scroll inutile. */}
          <div className="flex min-h-screen flex-col md:pl-64">
            <Sidebar />
            <main id="contenuto" className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
          <CheckInFab />
          <LanguageSwitcher className="fixed right-4 top-4 z-40 hidden md:flex" />
        </LocaleProvider>
      </body>
    </html>
  );
}
