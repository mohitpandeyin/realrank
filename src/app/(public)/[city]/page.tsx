import type { Metadata } from "next";

import { PublicShell } from "@/components/navigation/Shells";
import { FoundationPage } from "@/components/ui/FoundationPage";

type CityPageProps = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = await params;
  return { title: `Real Estate Companies in ${city}` };
}

export default async function CityPage({ params }: CityPageProps) {
  const { city } = await params;
  return (
    <PublicShell>
      <FoundationPage
        eyebrow="City index"
        title="Realrank Index"
        description={`Canonical city route reserved for ${city}. Discovery content arrives in its implementation milestone.`}
      />
    </PublicShell>
  );
}
