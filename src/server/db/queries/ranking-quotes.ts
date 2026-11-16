import "server-only";

import { sql } from "drizzle-orm";

import { getDatabase } from "@/server/db/client";

export type NewEntityRankQuote = Readonly<{
  amountRupees: string;
  estimatedPosition: number;
  firstPlaceAmountRupees: string;
  expiresAt: string;
}>;

type QuoteRow = {
  estimated_position: string | number;
  top_total_paise: string | bigint;
  expires_at: string | Date;
};

export async function getNewEntityRankQuote(
  citySlug: string,
  amountRupees: bigint,
): Promise<NewEntityRankQuote | null> {
  const amountPaise = amountRupees * 100n;
  const database = getDatabase();
  const result = await database.execute<QuoteRow>(sql`
    SELECT
      1 + count(rankings.entity_id) FILTER (
        WHERE rankings.shared_total_ranking_credit_paise >= ${amountPaise}
      ) AS estimated_position,
      COALESCE(max(rankings.shared_total_ranking_credit_paise), 0) AS top_total_paise,
      now() + interval '2 minutes' AS expires_at
    FROM cities
    LEFT JOIN public_city_rankings rankings ON rankings.city_id = cities.id
    WHERE cities.slug = ${citySlug}
      AND cities.realrank_status = 'LIVE'
    GROUP BY cities.id
  `);

  const quote = result.rows[0];
  if (!quote) return null;

  const topTotalPaise = BigInt(quote.top_total_paise);
  const firstPlaceAmountPaise = topTotalPaise > 0n ? topTotalPaise + 100n : 1_000n;
  const expiresAt =
    quote.expires_at instanceof Date ? quote.expires_at.toISOString() : quote.expires_at;

  return {
    amountRupees: amountRupees.toString(),
    estimatedPosition: Number(quote.estimated_position),
    firstPlaceAmountRupees: (firstPlaceAmountPaise / 100n).toString(),
    expiresAt,
  };
}
