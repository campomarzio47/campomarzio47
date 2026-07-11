import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import CheckInFab from "@/components/CheckInFab";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LocaleProvider } from "@/components/LocaleProvider";
import { dictionaries } from "@/content/dictionaries";
import { LOCALE_COOKIE, defaultLocale, isLocale } from "@/lib/locale";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: dictionaries[defaultLocale].meta.title,
  description: dictionaries[defaultLocale].meta.description,
};

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
        <LocaleProvider initialLocale={initialLocale}>
          <div className="md:pl-64">
            <Sidebar />
            <main className="min-h-screen">{children}</main>
          </div>
          <CheckInFab />
          <LanguageSwitcher className="fixed right-4 top-4 z-40 hidden md:flex" />
        </LocaleProvider>
      </body>
    </html>
  );
}
