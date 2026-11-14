import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/ui/PublicInfoPage";

export const metadata: Metadata = { title: "How it works" };

export default function HowItWorksPage() {
  return (
    <PublicInfoPage
      title="How Realrank works"
      description="A concise explanation of discovery, Rank total and direct contact will live here."
    />
  );
}
