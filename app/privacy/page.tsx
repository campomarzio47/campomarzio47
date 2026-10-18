import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("privacy", "/privacy");

export default function PrivacyPage() {
  return <LegalPage doc="privacy" />;
}
