import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/ui/PublicInfoPage";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <PublicInfoPage title="Terms" description="Legal content will be finalized before launch." />
  );
}
