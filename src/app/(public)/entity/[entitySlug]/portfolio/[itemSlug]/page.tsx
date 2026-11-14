import type { Metadata } from "next";

import { PublicShell } from "@/components/navigation/Shells";
import { FoundationPage } from "@/components/ui/FoundationPage";

type PortfolioItemPageProps = {
  params: Promise<{ entitySlug: string; itemSlug: string }>;
};

export async function generateMetadata({ params }: PortfolioItemPageProps): Promise<Metadata> {
  const { itemSlug } = await params;
  return { title: itemSlug };
}

export default async function PortfolioItemPage({ params }: PortfolioItemPageProps) {
  const { entitySlug, itemSlug } = await params;
  return (
    <PublicShell>
      <FoundationPage
        eyebrow="Portfolio"
        title={itemSlug}
        description={`Canonical portfolio-item route for ${entitySlug}.`}
      />
    </PublicShell>
  );
}
