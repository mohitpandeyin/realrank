import "server-only";

import { randomUUID } from "node:crypto";
import { sql } from "drizzle-orm";
import { z } from "zod";

import { getDatabase } from "@/server/db/client";

export const razorpayWebhookSchema = z.object({
  event: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

const capturedPaymentSchema = z.object({
  event: z.literal("payment.captured"),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        amount: z.number().int().positive(),
        currency: z.literal("INR"),
        status: z.literal("captured"),
        captured: z.literal(true),
      }),
    }),
  }),
});

type WebhookResult = Readonly<{
  status: "processed" | "duplicate" | "ignored";
}>;

type EventRow = { id: string; processed_at: Date | string | null };

function slugifyEntityName(name: string, checkoutId: string): string {
  const base = name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 70);
  return `${base || "entity"}-${checkoutId.replaceAll("-", "").slice(0, 8)}`;
}

async function registerEvent(
  eventId: string,
  eventType: string,
  payload: unknown,
): Promise<EventRow> {
  const database = getDatabase();
  const inserted = await database.execute<EventRow>(sql`
    INSERT INTO gateway_webhook_events (
      id, gateway, gateway_event_id, event_type, signature_valid, payload
    ) VALUES (
      ${randomUUID()}::uuid, 'RAZORPAY', ${eventId}, ${eventType}, true,
      ${JSON.stringify(payload)}::jsonb
    )
    ON CONFLICT (gateway, gateway_event_id) DO NOTHING
    RETURNING id, processed_at
  `);
  if (inserted.rows[0]) return inserted.rows[0];

  const existing = await database.execute<EventRow>(sql`
    SELECT id, processed_at
    FROM gateway_webhook_events
    WHERE gateway = 'RAZORPAY' AND gateway_event_id = ${eventId}
  `);
  if (!existing.rows[0]) throw new Error("Could not register Razorpay webhook event.");
  return existing.rows[0];
}

async function markEventError(eventRecordId: string, error: unknown): Promise<void> {
  const message = error instanceof Error ? error.message : "Unknown webhook processing error";
  await getDatabase().execute(sql`
    UPDATE gateway_webhook_events
    SET processing_error = ${message.slice(0, 500)}
    WHERE id = ${eventRecordId}::uuid AND processed_at IS NULL
  `);
}

export async function processRazorpayWebhook(
  eventId: string,
  payload: unknown,
): Promise<WebhookResult> {
  const envelope = razorpayWebhookSchema.parse(payload);
  const eventRecord = await registerEvent(eventId, envelope.event, payload);
  if (eventRecord.processed_at) return { status: "duplicate" };

  if (envelope.event !== "payment.captured") {
    await getDatabase().execute(sql`
      UPDATE gateway_webhook_events
      SET processed_at = now(), processing_error = NULL
      WHERE id = ${eventRecord.id}::uuid AND processed_at IS NULL
    `);
    return { status: "ignored" };
  }

  try {
    const captured = capturedPaymentSchema.parse(payload).payload.payment.entity;
    const database = getDatabase();

    const result = await database.transaction(async (transaction) => {
      const lockedEvent = await transaction.execute<EventRow>(sql`
        SELECT id, processed_at
        FROM gateway_webhook_events
        WHERE id = ${eventRecord.id}::uuid
        FOR UPDATE
      `);
      if (lockedEvent.rows[0]?.processed_at) return { status: "duplicate" as const };

      type PaymentRow = {
        payment_id: string;
        payment_status: string;
        gateway_payment_id: string | null;
        existing_entity_id: string | null;
        checkout_id: string;
        checkout_status: string;
        entity_name: string;
        phone_e164: string;
        city_id: string;
        amount_paise: string | bigint;
      };

      const paymentResult = await transaction.execute<PaymentRow>(sql`
        SELECT
          payments.id AS payment_id,
          payments.status AS payment_status,
          payments.gateway_payment_id,
          payments.entity_id AS existing_entity_id,
          pending_checkouts.id AS checkout_id,
          pending_checkouts.status AS checkout_status,
          pending_checkouts.requested_entity_name AS entity_name,
          pending_checkouts.requested_contact_phone_e164 AS phone_e164,
          pending_checkout_line_items.requested_city_id AS city_id,
          pending_checkout_line_items.amount_paise
        FROM payments
        JOIN pending_checkouts ON pending_checkouts.id = payments.pending_checkout_id
        JOIN pending_checkout_line_items
          ON pending_checkout_line_items.pending_checkout_id = pending_checkouts.id
         AND pending_checkout_line_items.purpose = 'RANK_CONTRIBUTION'
        WHERE payments.gateway = 'RAZORPAY'
          AND payments.gateway_order_id = ${captured.order_id}
        FOR UPDATE OF payments, pending_checkouts
      `);
      const payment = paymentResult.rows[0];
      if (!payment) throw new Error("Captured order does not match an internal payment.");
      if (BigInt(captured.amount) !== BigInt(payment.amount_paise)) {
        throw new Error("Captured amount does not match the internal order.");
      }
      if (payment.payment_status === "CAPTURED") {
        if (payment.gateway_payment_id !== captured.id) {
          throw new Error("Captured order is already linked to a different payment.");
        }
        await transaction.execute(sql`
          UPDATE gateway_webhook_events
          SET processed_at = now(), processing_error = NULL
          WHERE id = ${eventRecord.id}::uuid
        `);
        return { status: "processed" as const };
      }
      if (!payment.entity_name || !payment.phone_e164 || !payment.city_id) {
        throw new Error("Checkout is missing required new-entity data.");
      }
      if (!["ORDERED", "PAYMENT_PENDING"].includes(payment.checkout_status)) {
        throw new Error("Checkout is not in a capturable state.");
      }

      const entityId = payment.existing_entity_id ?? randomUUID();
      if (!payment.existing_entity_id) {
        await transaction.execute(sql`
          INSERT INTO entities (
            id, public_name, public_slug, contact_method, contact_phone_e164,
            publication_status, moderation_status
          ) VALUES (
            ${entityId}::uuid, ${payment.entity_name},
            ${slugifyEntityName(payment.entity_name, payment.checkout_id)},
            'WHATSAPP', ${payment.phone_e164}, 'PUBLISHED', 'APPROVED'
          )
        `);
      }

      await transaction.execute(sql`
        UPDATE payments
        SET entity_id = ${entityId}::uuid,
            gateway_payment_id = ${captured.id},
            captured_gross_paise = ${BigInt(captured.amount)},
            status = 'CAPTURED', captured_at = now(), updated_at = now()
        WHERE id = ${payment.payment_id}::uuid
      `);

      const paymentLineItemId = randomUUID();
      await transaction.execute(sql`
        INSERT INTO payment_line_items (
          id, payment_id, purpose, entity_id, requested_city_id, amount_paise,
          allocation_reference
        ) VALUES (
          ${paymentLineItemId}::uuid, ${payment.payment_id}::uuid, 'RANK_CONTRIBUTION',
          ${entityId}::uuid, ${payment.city_id}::uuid, ${BigInt(payment.amount_paise)},
          ${`razorpay:${captured.id}:rank`}
        )
      `);

      await transaction.execute(sql`
        INSERT INTO ranking_contributions (
          id, entity_id, amount_paise, source, payment_line_item_id
        ) VALUES (
          ${randomUUID()}::uuid, ${entityId}::uuid, ${BigInt(payment.amount_paise)},
          'PAYMENT', ${paymentLineItemId}::uuid
        )
      `);

      if (!payment.existing_entity_id) {
        const citySlotIds = [randomUUID(), randomUUID(), randomUUID()];
        await transaction.execute(sql`
          INSERT INTO city_slots (id, entity_id, slot_number, entitlement_source) VALUES
            (${citySlotIds[0]}::uuid, ${entityId}::uuid, 1, 'INCLUDED'),
            (${citySlotIds[1]}::uuid, ${entityId}::uuid, 2, 'INCLUDED'),
            (${citySlotIds[2]}::uuid, ${entityId}::uuid, 3, 'INCLUDED')
        `);
        await transaction.execute(sql`
          INSERT INTO city_listings (
            id, entity_id, city_slot_id, city_id, assigned_at, activated_at,
            publication_status
          ) VALUES (
            ${randomUUID()}::uuid, ${entityId}::uuid, ${citySlotIds[0]}::uuid,
            ${payment.city_id}::uuid, now(), now(), 'PUBLISHED'
          )
        `);
      }

      await transaction.execute(sql`
        UPDATE pending_checkout_line_items
        SET entity_id = ${entityId}::uuid
        WHERE pending_checkout_id = ${payment.checkout_id}::uuid
          AND purpose = 'RANK_CONTRIBUTION'
      `);
      await transaction.execute(sql`
        UPDATE pending_checkouts
        SET entity_id = ${entityId}::uuid, status = 'CAPTURED', updated_at = now()
        WHERE id = ${payment.checkout_id}::uuid
      `);
      await transaction.execute(sql`
        UPDATE gateway_webhook_events
        SET processed_at = now(), processing_error = NULL
        WHERE id = ${eventRecord.id}::uuid
      `);

      return { status: "processed" as const };
    });

    return result;
  } catch (error) {
    await markEventError(eventRecord.id, error);
    throw error;
  }
}
