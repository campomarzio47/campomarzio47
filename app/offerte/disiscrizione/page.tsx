import type { Metadata } from "next";
import OffersUnsubscribe from "@/components/OffersUnsubscribe";
import { findSubscriber } from "@/lib/newsletter";

export const metadata: Metadata = {
  title: "Offerte via email",
  robots: { index: false, follow: false },
};

/** "mario.rossi@example.com" → "m•••@example.com": il link può essere inoltrato. */
function mask(email: string): string {
  const [user, domain] = email.split("@");
  return `${user.slice(0, 1)}•••@${domain}`;
}

/**
 * Disiscrizione dalle offerte, dal link in fondo a ogni email.
 *
 * Aprire il link non basta a disiscriversi: serve il bottone. Molti
 * filtri antispam aprono i link delle email per controllarli, e un GET
 * che cancella toglierebbe dall'elenco chi non l'ha mai chiesto. Il clic
 * unico dei programmi di posta (List-Unsubscribe-Post) arriva invece
 * direttamente all'API con un POST.
 */
export default async function UnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string; fatto?: string }>;
}) {
  const { t = "", fatto } = await searchParams;
  if (fatto === "1") return <OffersUnsubscribe state="done" />;
  const email = await findSubscriber(t);
  return email ? <OffersUnsubscribe state="ask" email={mask(email)} token={t} /> : <OffersUnsubscribe state="notFound" />;
}
