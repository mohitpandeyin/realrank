import type { Metadata } from "next";

import { PublicInfoPage } from "@/components/ui/PublicInfoPage";

export const metadata: Metadata = { title: "Ranking Policy" };

export default function RankingPolicyPage() {
  return (
    <PublicInfoPage
      title="Ranking Policy"
      description="Realrank positions are sponsored and ordered by Rank total, not quality or recommendation."
    />
  );
}
