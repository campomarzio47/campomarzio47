import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import Gallery from "@/components/Gallery";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].photos.title} — Campo Marzio 47`,
};

export default function FotoPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section="photos" />
      <Gallery />
    </div>
  );
}
