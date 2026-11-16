import "server-only";

import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";

import type { PaymentGateway } from "@/server/payments/types";

import { getDatabase } from "../client";

export type NewEntityCheckoutInput = Readonly<{
  citySlug: string;
  entityName: string;
  contactPhoneE164: string;
  amountRupees: bigint;
}>;

export type NewEntityCheckout = Readonly<{
  checkoutId: string;
  orderId: string;
  amountPaise: number;
  currency: "INR";
  estimatedPosition: number;
  expiresAt: string;
}>;

type CheckoutQuoteRow = {
  city_id: string;
  city_name: string;
  estimated_position: string | number;
  top_total_paise: string | bigint;
  expires_at: string | Date;
};

export async function createNewEntityCheckout(
  input: NewEntityCheckoutInput,
  gateway: PaymentGateway,
): Promise<NewEntityCheckout | null> {
  const amountPaise = input.amountRupees * 100n;
  const checkoutId = randomUUID();
  const lineItemId = randomUUID();
  const paymentId = randomUUID();
  const idempotencyKey = `listing-entry:${checkoutId}`;
  const database = getDatabase();

  const quoteResult = await database.transaction(async (transaction) => {
    const result = await transaction.execute<CheckoutQuoteRow>(sql`
      SELECT
        cities.id AS city_id,
        cities.canonical_name AS city_name,
        1 + count(rankings.entity_id) FILTER (
          WHERE rankings.shared_total_ranking_credit_paise >= ${amountPaise}
        ) AS estimated_position,
        COALESCE(max(rankings.shared_total_ranking_credit_paise), 0) AS top_total_paise,
        now() + interval '2 minutes' AS expires_at
      FROM cities
      LEFT JOIN public_city_rankings rankings ON rankings.city_id = cities.id
      WHERE cities.slug = ${input.citySlug}
        AND cities.realrank_status = 'LIVE'
      GROUP BY cities.id
    `);
    const quote = result.rows[0];
    if (!quote) return null;

    await transaction.execute(sql`
      INSERT INTO pending_checkouts (
        id, requested_entity_name, requested_contact_phone_e164, requested_city_id,
        intent, status, idempotency_key, expires_at
      ) VALUES (
        ${checkoutId}::uuid, ${input.entityName}, ${input.contactPhoneE164}, ${quote.city_id}::uuid,
        'NEW_ENTITY', 'CREATED', ${idempotencyKey}, ${quote.expires_at}::timestamptz
      )
    `);

    await transaction.execute(sql`
      INSERT INTO pending_checkout_line_items (
        id, pending_checkout_id, purpose, requested_city_id, target_position,
        quoted_competitor_total_paise, amount_paise, quote_expires_at
      ) VALUES (
        ${lineItemId}::uuid, ${checkoutId}::uuid, 'RANK_CONTRIBUTION', ${quote.city_id}::uuid,
        ${Number(quote.estimated_position)}, ${BigInt(quote.top_total_paise)}, ${amountPaise},
        ${quote.expires_at}::timestamptz
      )
    `);

    return quote;
  });

  if (!quoteResult) return null;

  const order = await gateway.createOrder({
    amountPaise,
    currency: "INR",
    receipt: `rr_${checkoutId.replaceAll("-", "").slice(0, 32)}`,
    notes: {
      checkout_id: checkoutId,
      city: quoteResult.city_name,
      intent: "NEW_ENTITY",
    },
  });

  await database.transaction(async (transaction) => {
    await transaction.execute(sql`
      INSERT INTO payments (
        id, pending_checkout_id, gateway, gateway_order_id, currency, status, refund_state
      ) VALUES (
        ${paymentId}::uuid, ${checkoutId}::uuid, 'RAZORPAY', ${order.id}, 'INR',
        'ORDER_CREATED', 'NONE'
      )
    `);
    await transaction.execute(sql`
      UPDATE pending_checkouts
      SET status = 'ORDERED', updated_at = now()
      WHERE id = ${checkoutId}::uuid AND status = 'CREATED'
    `);
  });

  const expiresAt =
    quoteResult.expires_at instanceof Date
      ? quoteResult.expires_at.toISOString()
      : quoteResult.expires_at;

  return {
    checkoutId,
    orderId: order.id,
    amountPaise: Number(order.amountPaise),
    currency: order.currency,
    estimatedPosition: Number(quoteResult.estimated_position),
    expiresAt,
  };
}
