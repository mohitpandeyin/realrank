import type { Metadata } from "next";

import { PublicShell } from "@/components/navigation/Shells";
import { FoundationPage } from "@/components/ui/FoundationPage";

type EntityPageProps = { params: Promise<{ entitySlug: string }> };

export async function generateMetadata({ params }: EntityPageProps): Promise<Metadata> {
  const { entitySlug } = await params;
  return { title: `${entitySlug} profile` };
}

export default async function EntityPage({ params }: EntityPageProps) {
  const { entitySlug } = await params;
  return (
    <PublicShell>
      <FoundationPage
        eyebrow="Entity profile"
        title={entitySlug}
        description="Canonical public profile route. Profile implementation is intentionally deferred."
      />
    </PublicShell>
  );
}
