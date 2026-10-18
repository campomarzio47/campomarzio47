import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";
import { siteFeatures } from "@/lib/features";

export const metadata: Metadata = pageMetadata("cookies", "/cookie-policy");

export default function CookiePolicyPage() {
  return <LegalPage doc="cookies" features={siteFeatures()} />;
}
