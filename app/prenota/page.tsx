import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import BookingForm from "@/components/BookingForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("booking", "/prenota");

export default async function PrenotaPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const { from, to } = await searchParams;

  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-10 md:pb-28 md:pt-20">
      <PageHeader section="booking" />
      <BookingForm initialFrom={from} initialTo={to} />
    </div>
  );
}
