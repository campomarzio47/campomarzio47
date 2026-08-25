import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CheckInFab from "@/components/CheckInFab";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LocaleProvider } from "@/components/LocaleProvider";
import { dictionaries } from "@/content/dictionaries";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/locale";
import { property } from "@/content/property";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
});

// Fallback all'URL Vercel attuale se NEXT_PUBLIC_SITE_URL non è
// impostato — da compilare col dominio reale per ogni nuovo progetto
// basato su questo modello (vedi .env.local.example).
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://campomarzio47.vercel.app";
const meta = dictionaries[defaultLocale].meta;

// ID misurazione Google Analytics (formato "G-XXXXXXXXXX"). Se la variabile
// non è impostata, lo script non viene caricato affatto: così in locale e
// nelle anteprime Vercel le visite di sviluppo non finiscono nelle
// statistiche reali del sito.
const gaId = process.env.NEXT_PUBLIC_GA_ID?.trim();

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
    images: [{ url: property.heroImage }],
    locale: "it_IT",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: [property.heroImage],
  },
};

// Dati strutturati (schema.org) per far capire a Google che questa è
// un'attività ricettiva con nome/indirizzo/contatto specifici — aiuta
// per ricerche locali tipo "affitto <nome> <città>". replace(/</...):
// se mai un valore contenesse "<", non deve poter chiudere in anticipo
// il tag <script> che lo racchiude.
function structuredData() {
  const json = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    description: dictionaries[defaultLocale].meta.description,
    image: `${siteUrl}${property.heroImage}`,
    url: siteUrl,
    telephone: property.host.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address.street,
      addressLocality: property.address.city,
      addressRegion: property.address.province,
      postalCode: property.address.zip,
      addressCountry: "IT",
    },
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
          <div className="md:pl-64">
            <Sidebar />
            <main className="min-h-screen">{children}</main>
          </div>
          <CheckInFab />
          <LanguageSwitcher className="fixed right-4 top-4 z-40 hidden md:flex" />
        </LocaleProvider>
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
