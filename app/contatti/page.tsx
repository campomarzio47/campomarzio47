import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import ContactForm from "@/components/ContactForm";
import ContactInfo from "@/components/ContactInfo";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("contact", "/contatti");

export default function ContattiPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-20 pt-12 md:px-10 md:pb-28 md:pt-20">
      <PageHeader section="contact" />

      <div className="grid gap-16 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <ContactInfo />
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
