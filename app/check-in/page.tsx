import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CheckInForm from "@/components/CheckInForm";
import { dictionaries } from "@/content/dictionaries";
import { defaultLocale } from "@/lib/locale";

export const metadata: Metadata = {
  title: `${dictionaries[defaultLocale].checkin.title} — Campo Marzio 47`,
};

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section="checkin" />
      <CheckInForm />
    </div>
  );
}
