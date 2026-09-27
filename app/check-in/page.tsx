import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CheckInForm from "@/components/CheckInForm";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("checkin", "/check-in");

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:px-10 md:py-16">
      <PageHeader section="checkin" />
      <CheckInForm />
    </div>
  );
}
