"use client";

import { useLocale } from "@/components/LocaleProvider";
import BookingRequestForm from "@/components/BookingRequestForm";

export default function BookingRequestSection() {
  const { dict } = useLocale();

  return (
    <div className="mt-14">
      <h2 className="mb-2 font-display text-2xl">{dict.bookingRequest.title}</h2>
      <p className="mb-6 max-w-xl text-sm text-mid">{dict.bookingRequest.description}</p>
      <BookingRequestForm />
    </div>
  );
}
