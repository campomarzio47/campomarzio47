import type { Metadata } from "next";
import BookingPaidConfirmation from "@/components/BookingPaidConfirmation";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";
import { property } from "@/content/property";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].bookingConfirmation.payTitle} — ${property.name}`,
  robots: { index: false, follow: false },
};

/**
 * Ritorno da Stripe dopo aver autorizzato la carta. Non legge nulla da
 * Stripe: le email (all'ospite e all'host) partono dal webhook, che è
 * l'unico a sapere con certezza che il pagamento è andato a buon fine.
 */
export default function PrenotaConfermaPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-10 md:pb-28 md:pt-20">
      <BookingPaidConfirmation />
    </div>
  );
}
