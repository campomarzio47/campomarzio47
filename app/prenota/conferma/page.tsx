import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";
import { property } from "@/content/property";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].bookingConfirmation.title} — ${property.name}`,
  robots: { index: false },
};

export default function PrenotaConfermaPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20 text-center md:px-10">
      <PageHeader section="bookingConfirmation" />
    </div>
  );
}
