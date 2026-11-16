import type { Metadata } from "next";

import { PublicShell } from "@/components/navigation/Shells";
import { DiscoveryHome } from "@/features/discovery/DiscoveryHome";
import { getPublicDiscovery } from "@/server/db/queries/public-discovery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Real Estate Companies & Marketers in Indore",
};

type HomePageProps = {
  searchParams: Promise<{ category?: string | string[] }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const { category } = await searchParams;
  const requestedFilter = Array.isArray(category) ? category[0] : category;
  const discovery = await getPublicDiscovery("indore", requestedFilter ?? null);

  return (
    <PublicShell home>
      <DiscoveryHome discovery={discovery} />
    </PublicShell>
  );
}
