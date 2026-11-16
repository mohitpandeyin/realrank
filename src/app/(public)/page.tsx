import type { Metadata } from "next";

import { PublicShell } from "@/components/navigation/Shells";
import { DiscoveryHome } from "@/features/discovery/DiscoveryHome";
import { getPublicDiscovery } from "@/server/db/queries/public-discovery";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Real Estate Companies & Marketers in Indore",
};

type HomePageProps = {
  searchParams: Promise<{
    amount?: string | string[];
    category?: string | string[];
  }>;
};

function initialRankAmount(value: string | string[] | undefined): string {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (!candidate || !/^[0-9]{1,9}$/.test(candidate)) return "10";

  const amount = BigInt(candidate);
  return amount >= 10n ? amount.toString() : "10";
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { amount, category } = await searchParams;
  const requestedFilter = Array.isArray(category) ? category[0] : category;
  const discovery = await getPublicDiscovery("indore", requestedFilter ?? null);

  return (
    <PublicShell home>
      <DiscoveryHome discovery={discovery} initialAmountRupees={initialRankAmount(amount)} />
    </PublicShell>
  );
}
