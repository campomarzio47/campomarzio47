import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata("terms", "/termini");

export default function TerminiPage() {
  return <LegalPage doc="terms" />;
}
