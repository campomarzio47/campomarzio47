"use client";

import { CalendarCheck } from "lucide-react";
import { useLocale } from "@/components/LocaleProvider";
import BookingRequestForm from "@/components/BookingRequestForm";

export default function BookingRequestSection() {
  const { dict } = useLocale();

  return (
    <div
      id="richiedi-prenotazione"
      className="mt-14 scroll-mt-24 rounded-xl border-2 border-bordeaux/20 bg-bordeaux/5 p-6 md:p-8"
    >
      <div className="mb-2 flex items-center gap-2">
        <CalendarCheck size={22} strokeWidth={2} className="text-bordeaux" />
        <h2 className="font-display text-2xl md:text-3xl">{dict.bookingRequest.title}</h2>
      </div>
      <p className="mb-6 max-w-xl text-sm text-mid">{dict.bookingRequest.description}</p>
      <BookingRequestForm />
    </div>
  );
}
