import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ReviewsSection from "@/components/ReviewsSection";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].reviews.title} — Campo Marzio 47`,
};

export default function RecensioniPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section="reviews" />
      <ReviewsSection />
    </div>
  );
}
