import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import BookingRequestSection from "@/components/BookingRequestSection";
import HouseRules from "@/components/HouseRules";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].availability.title} — Campo Marzio 47`,
};

export default function DisponibilitaPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section="availability" />
      <AvailabilityCalendar />
      <BookingRequestSection />
      <HouseRules />
    </div>
  );
}
