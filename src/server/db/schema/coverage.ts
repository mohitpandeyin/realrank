import { sql } from "drizzle-orm";
import {
  bigint,
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { cities, discoveryFilters, entities } from "./identity";

const timestampTz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const entityDiscoveryFilters = pgTable(
  "entity_discovery_filters",
  {
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    discoveryFilterId: uuid("discovery_filter_id")
      .notNull()
      .references(() => discoveryFilters.id, { onDelete: "restrict" }),
    selectedAt: timestampTz("selected_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.entityId, table.discoveryFilterId] }),
    index("entity_discovery_filters_entity_selected_idx").on(table.entityId, table.selectedAt),
  ],
);

export const pendingCheckouts = pgTable(
  "pending_checkouts",
  {
    id: uuid("id").primaryKey(),
    entityId: uuid("entity_id").references(() => entities.id, { onDelete: "restrict" }),
    requestedEntityName: text("requested_entity_name"),
    requestedContactPhoneE164: text("requested_contact_phone_e164"),
    requestedCityId: uuid("requested_city_id").references(() => cities.id, {
      onDelete: "restrict",
    }),
    intent: text("intent")
      .$type<"NEW_ENTITY" | "RANK_TOP_UP" | "CITY_SLOT_PURCHASE" | "COMBINED">()
      .notNull(),
    status: text("status")
      .$type<
        "CREATED" | "ORDERED" | "PAYMENT_PENDING" | "CAPTURED" | "EXPIRED" | "CANCELLED" | "FAILED"
      >()
      .notNull(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    expiresAt: timestampTz("expires_at").notNull(),
    createdAt: timestampTz("created_at").notNull(),
    updatedAt: timestampTz("updated_at").notNull(),
  },
  (table) => [index("pending_checkouts_status_expires_idx").on(table.status, table.expiresAt)],
);

export const pendingCheckoutLineItems = pgTable(
  "pending_checkout_line_items",
  {
    id: uuid("id").primaryKey(),
    pendingCheckoutId: uuid("pending_checkout_id")
      .notNull()
      .references(() => pendingCheckouts.id, { onDelete: "cascade" }),
    purpose: text("purpose").$type<"RANK_CONTRIBUTION" | "CITY_SLOT_PURCHASE">().notNull(),
    entityId: uuid("entity_id").references(() => entities.id, { onDelete: "restrict" }),
    requestedCityId: uuid("requested_city_id").references(() => cities.id, {
      onDelete: "restrict",
    }),
    targetDiscoveryFilterId: uuid("target_discovery_filter_id").references(
      () => discoveryFilters.id,
      {
        onDelete: "restrict",
      },
    ),
    targetPosition: integer("target_position"),
    quotedCompetitorTotalPaise: bigint("quoted_competitor_total_paise", { mode: "bigint" }),
    amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
    quoteExpiresAt: timestampTz("quote_expires_at").notNull(),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("pending_checkout_line_items_checkout_purpose_unique").on(
      table.pendingCheckoutId,
      table.purpose,
    ),
    index("pending_checkout_line_items_checkout_idx").on(table.pendingCheckoutId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey(),
    pendingCheckoutId: uuid("pending_checkout_id")
      .notNull()
      .references(() => pendingCheckouts.id, { onDelete: "restrict" }),
    entityId: uuid("entity_id").references(() => entities.id, { onDelete: "restrict" }),
    gateway: text("gateway").$type<"RAZORPAY">().notNull(),
    gatewayOrderId: text("gateway_order_id").notNull().unique(),
    gatewayPaymentId: text("gateway_payment_id").unique(),
    currency: text("currency").$type<"INR">().notNull(),
    capturedGrossPaise: bigint("captured_gross_paise", { mode: "bigint" }),
    status: text("status")
      .$type<
        | "ORDER_CREATED"
        | "AUTHORIZED"
        | "CAPTURED"
        | "FAILED"
        | "REFUNDED"
        | "PARTIALLY_REFUNDED"
        | "CHARGEBACK"
      >()
      .notNull(),
    capturedAt: timestampTz("captured_at"),
    refundState: text("refund_state")
      .$type<"NONE" | "PENDING" | "PARTIAL" | "FULL" | "DISPUTED">()
      .notNull(),
    createdAt: timestampTz("created_at").notNull(),
    updatedAt: timestampTz("updated_at").notNull(),
  },
  (table) => [
    index("payments_checkout_created_idx").on(table.pendingCheckoutId, table.createdAt),
    index("payments_entity_created_idx").on(table.entityId, table.createdAt),
  ],
);

export const paymentLineItems = pgTable(
  "payment_line_items",
  {
    id: uuid("id").primaryKey(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),
    purpose: text("purpose").$type<"RANK_CONTRIBUTION" | "CITY_SLOT_PURCHASE">().notNull(),
    entityId: uuid("entity_id").references(() => entities.id, { onDelete: "restrict" }),
    requestedCityId: uuid("requested_city_id").references(() => cities.id, {
      onDelete: "restrict",
    }),
    amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
    allocationReference: text("allocation_reference").notNull().unique(),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("payment_line_items_payment_purpose_unique").on(table.paymentId, table.purpose),
    index("payment_line_items_payment_idx").on(table.paymentId),
  ],
);

export const citySlots = pgTable(
  "city_slots",
  {
    id: uuid("id").primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    slotNumber: smallint("slot_number").notNull(),
    entitlementSource: text("entitlement_source").$type<"INCLUDED" | "PAID">().notNull(),
    purchasePaymentLineItemId: uuid("purchase_payment_line_item_id")
      .unique()
      .references(() => paymentLineItems.id, { onDelete: "restrict" }),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [uniqueIndex("city_slots_entity_number_unique").on(table.entityId, table.slotNumber)],
);

export const cityListings = pgTable(
  "city_listings",
  {
    id: uuid("id").primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    citySlotId: uuid("city_slot_id")
      .notNull()
      .references(() => citySlots.id, { onDelete: "restrict" }),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "restrict" }),
    contactMethodOverride: text("contact_method_override").$type<"CALL" | "WHATSAPP">(),
    contactPhoneE164Override: text("contact_phone_e164_override"),
    contactPhoneVerifiedAtOverride: timestampTz("contact_phone_verified_at_override"),
    assignedAt: timestampTz("assigned_at").notNull(),
    activatedAt: timestampTz("activated_at"),
    unassignedAt: timestampTz("unassigned_at"),
    publicationStatus: text("publication_status")
      .$type<"DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "SUSPENDED">()
      .notNull(),
    createdAt: timestampTz("created_at").notNull(),
    updatedAt: timestampTz("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("city_listings_one_active_slot")
      .on(table.citySlotId)
      .where(sql`${table.unassignedAt} IS NULL`),
    uniqueIndex("city_listings_one_active_entity_city")
      .on(table.entityId, table.cityId)
      .where(sql`${table.unassignedAt} IS NULL`),
    index("city_listings_city_publication_idx").on(table.cityId, table.publicationStatus),
  ],
);

export const gatewayWebhookEvents = pgTable(
  "gateway_webhook_events",
  {
    id: uuid("id").primaryKey(),
    gateway: text("gateway").$type<"RAZORPAY">().notNull(),
    gatewayEventId: text("gateway_event_id").notNull(),
    eventType: text("event_type").notNull(),
    signatureValid: boolean("signature_valid").notNull(),
    payload: jsonb("payload").notNull(),
    receivedAt: timestampTz("received_at").notNull(),
    processedAt: timestampTz("processed_at"),
    processingError: text("processing_error"),
  },
  (table) => [
    uniqueIndex("gateway_webhook_events_gateway_event_unique").on(
      table.gateway,
      table.gatewayEventId,
    ),
  ],
);

export const rankingContributions = pgTable(
  "ranking_contributions",
  {
    id: uuid("id").primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "restrict" }),
    amountPaise: bigint("amount_paise", { mode: "bigint" }).notNull(),
    source: text("source").$type<"PAYMENT" | "PROMOTIONAL_CREDIT" | "REVERSAL">().notNull(),
    paymentLineItemId: uuid("payment_line_item_id").references(() => paymentLineItems.id, {
      onDelete: "restrict",
    }),
    reasonCode: text("reason_code"),
    reversalOfId: uuid("reversal_of_id").unique(),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [
    index("ranking_contributions_entity_created_idx").on(table.entityId, table.createdAt, table.id),
  ],
);

export const paymentSuccessSessions = pgTable(
  "payment_success_sessions",
  {
    id: uuid("id").primaryKey(),
    paymentId: uuid("payment_id")
      .notNull()
      .references(() => payments.id, { onDelete: "restrict" }),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "restrict" }),
    phoneE164: text("phone_e164").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    status: text("status").$type<"ACTIVE" | "CONSUMED" | "EXPIRED" | "REVOKED">().notNull(),
    expiresAt: timestampTz("expires_at").notNull(),
    consumedAt: timestampTz("consumed_at"),
    createdAt: timestampTz("created_at").notNull(),
    updatedAt: timestampTz("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("payment_success_sessions_active_payment_unique")
      .on(table.paymentId)
      .where(sql`${table.status} = 'ACTIVE'`),
    index("payment_success_sessions_entity_status_idx").on(table.entityId, table.status),
  ],
);
