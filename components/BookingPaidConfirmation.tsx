"use client";

import { Confirmation } from "@/components/BookingForm";
import { useLocale } from "@/components/LocaleProvider";

export default function BookingPaidConfirmation() {
  const { dict } = useLocale();
  const t = dict.bookingConfirmation;
  return <Confirmation title={t.payTitle} body={t.paySubtitle} back={t.back} />;
}
