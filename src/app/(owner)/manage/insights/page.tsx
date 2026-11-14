import type { Metadata } from "next";

import { FoundationPage } from "@/components/ui/FoundationPage";

export const metadata: Metadata = { title: "Insights" };

export default function InsightsPage() {
  return (
    <FoundationPage
      eyebrow="Owner insights"
      title="Monitor growth"
      description="Privacy-safe performance reporting is reserved for the Insights milestone."
    />
  );
}
