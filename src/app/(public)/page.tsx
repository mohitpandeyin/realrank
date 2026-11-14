import type { Metadata } from "next";

import { PublicShell } from "@/components/navigation/Shells";
import { FoundationPage } from "@/components/ui/FoundationPage";

export const metadata: Metadata = {
  title: "Real Estate Companies & Marketers in Indore",
};

export default function HomePage() {
  return (
    <PublicShell home>
      <FoundationPage
        eyebrow="Now live in Indore"
        title="The Real Estate Discovery Index of Companies & Marketers."
        description="Where real estate companies and marketers build visibility, showcase portfolios and connect directly with property buyers."
      />
    </PublicShell>
  );
}
