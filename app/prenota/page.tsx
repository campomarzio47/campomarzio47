import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { pageMetadata } from "@/lib/seo";
import { paymentsEnabled } from "@/lib/stripe";

export const metadata: Metadata = pageMetadata("booking", "/prenota");

export default async function PrenotaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; annullato?: string }>;
}) {
  const { from, to, annullato } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-10 md:pb-28 md:pt-20">
      <BookingForm initialFrom={from} initialTo={to} payments={paymentsEnabled()} canceled={annullato === "1"} />
    </div>
  );
}
