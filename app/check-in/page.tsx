import type { Metadata } from "next";
import PageHeader from "@/components/PageHeader";
import CheckInForm from "@/components/CheckInForm";
import { pageMetadata } from "@/lib/seo";
import { siteFeatures } from "@/lib/features";

export const metadata: Metadata = pageMetadata("checkin", "/check-in");

export default function CheckInPage() {
  return (
    <div className="mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-10 md:pb-28 md:pt-20">
      <PageHeader section="checkin" />
      <CheckInForm newsletter={siteFeatures().newsletter} />
    </div>
  );
}
