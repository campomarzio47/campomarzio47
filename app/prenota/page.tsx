import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BookingForm from "@/components/BookingForm";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";
import { property } from "@/content/property";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].booking.title} — ${property.name}`,
};

export default function PrenotaPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section="booking" />
      <BookingForm />
    </div>
  );
}
