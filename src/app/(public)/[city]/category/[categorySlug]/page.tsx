import type { Metadata } from "next";

import { PublicShell } from "@/components/navigation/Shells";
import { FoundationPage } from "@/components/ui/FoundationPage";

type CategoryPageProps = {
  params: Promise<{ city: string; categorySlug: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { city, categorySlug } = await params;
  return { title: `${categorySlug} real estate companies in ${city}` };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { city, categorySlug } = await params;
  return (
    <PublicShell>
      <FoundationPage
        eyebrow="Category index"
        title="Realrank Index"
        description={`Canonical ${categorySlug} discovery route reserved for ${city}.`}
      />
    </PublicShell>
  );
}
