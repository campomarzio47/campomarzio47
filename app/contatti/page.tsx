import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import ContactInfo from "@/components/ContactInfo";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].contact.title} — Campo Marzio 47`,
};

export default function ContattiPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section="contact" />

      <div className="grid gap-10 md:grid-cols-2">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
}
