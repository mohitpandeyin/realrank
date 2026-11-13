BEGIN;

CREATE TABLE entity_discovery_filters (
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  discovery_filter_id uuid NOT NULL REFERENCES discovery_filters(id) ON DELETE RESTRICT,
  selected_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (entity_id, discovery_filter_id)
);

CREATE TABLE pending_checkouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid REFERENCES entities(id) ON DELETE RESTRICT,
  requested_entity_name text,
  requested_contact_phone_e164 text,
  requested_city_id uuid REFERENCES cities(id) ON DELETE RESTRICT,
  intent text NOT NULL CHECK (intent IN ('NEW_ENTITY', 'RANK_TOP_UP', 'CITY_SLOT_PURCHASE', 'COMBINED')),
  status text NOT NULL DEFAULT 'CREATED'
    CHECK (status IN ('CREATED', 'ORDERED', 'PAYMENT_PENDING', 'CAPTURED', 'EXPIRED', 'CANCELLED', 'FAILED')),
  idempotency_key text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (requested_contact_phone_e164 IS NULL OR requested_contact_phone_e164 ~ '^\+[1-9][0-9]{7,14}$')
);

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_checkout_id uuid NOT NULL REFERENCES pending_checkouts(id) ON DELETE RESTRICT,
  entity_id uuid REFERENCES entities(id) ON DELETE RESTRICT,
  gateway text NOT NULL DEFAULT 'RAZORPAY' CHECK (gateway IN ('RAZORPAY')),
  gateway_order_id text NOT NULL UNIQUE,
  gateway_payment_id text UNIQUE,
  currency text NOT NULL DEFAULT 'INR' CHECK (currency = 'INR'),
  captured_gross_paise bigint CHECK (captured_gross_paise IS NULL OR captured_gross_paise > 0),
  status text NOT NULL DEFAULT 'ORDER_CREATED'
    CHECK (status IN ('ORDER_CREATED', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CHARGEBACK')),
  captured_at timestamptz,
  refund_state text NOT NULL DEFAULT 'NONE' CHECK (refund_state IN ('NONE', 'PENDING', 'PARTIAL', 'FULL', 'DISPUTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (status IN ('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CHARGEBACK')
      AND captured_at IS NOT NULL AND gateway_payment_id IS NOT NULL AND captured_gross_paise IS NOT NULL)
    OR
    (status NOT IN ('CAPTURED', 'REFUNDED', 'PARTIALLY_REFUNDED', 'CHARGEBACK')
      AND captured_at IS NULL AND captured_gross_paise IS NULL)
  )
);

CREATE TABLE pending_checkout_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pending_checkout_id uuid NOT NULL REFERENCES pending_checkouts(id) ON DELETE CASCADE,
  purpose text NOT NULL CHECK (purpose IN ('RANK_CONTRIBUTION', 'CITY_SLOT_PURCHASE')),
  entity_id uuid REFERENCES entities(id) ON DELETE RESTRICT,
  requested_city_id uuid REFERENCES cities(id) ON DELETE RESTRICT,
  target_discovery_filter_id uuid REFERENCES discovery_filters(id) ON DELETE RESTRICT,
  target_position integer CHECK (target_position > 0),
  quoted_competitor_total_paise bigint CHECK (quoted_competitor_total_paise >= 0),
  amount_paise bigint NOT NULL CHECK (amount_paise > 0),
  quote_expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (pending_checkout_id, purpose)
);

CREATE TABLE payment_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  purpose text NOT NULL CHECK (purpose IN ('RANK_CONTRIBUTION', 'CITY_SLOT_PURCHASE')),
  entity_id uuid REFERENCES entities(id) ON DELETE RESTRICT,
  requested_city_id uuid REFERENCES cities(id) ON DELETE RESTRICT,
  amount_paise bigint NOT NULL CHECK (amount_paise > 0),
  allocation_reference text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE city_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  slot_number smallint NOT NULL CHECK (slot_number > 0),
  entitlement_source text NOT NULL CHECK (entitlement_source IN ('INCLUDED', 'PAID')),
  purchase_payment_line_item_id uuid UNIQUE REFERENCES payment_line_items(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, slot_number),
  CHECK (
    (slot_number BETWEEN 1 AND 3 AND entitlement_source = 'INCLUDED' AND purchase_payment_line_item_id IS NULL)
    OR
    (slot_number >= 4 AND entitlement_source = 'PAID' AND purchase_payment_line_item_id IS NOT NULL)
  )
);

CREATE TABLE city_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  city_slot_id uuid NOT NULL REFERENCES city_slots(id) ON DELETE RESTRICT,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  contact_method_override text CHECK (contact_method_override IN ('CALL', 'WHATSAPP')),
  contact_phone_e164_override text CHECK (contact_phone_e164_override IS NULL OR contact_phone_e164_override ~ '^\+[1-9][0-9]{7,14}$'),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  activated_at timestamptz,
  unassigned_at timestamptz,
  publication_status text NOT NULL DEFAULT 'DRAFT'
    CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'SUSPENDED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (unassigned_at IS NULL OR unassigned_at >= assigned_at),
  CHECK (publication_status <> 'PUBLISHED' OR (activated_at IS NOT NULL AND unassigned_at IS NULL)),
  CHECK (unassigned_at IS NULL OR publication_status <> 'PUBLISHED')
);

CREATE UNIQUE INDEX city_listings_one_active_slot
  ON city_listings (city_slot_id) WHERE unassigned_at IS NULL;

CREATE UNIQUE INDEX city_listings_one_active_entity_city
  ON city_listings (entity_id, city_id) WHERE unassigned_at IS NULL;

CREATE TABLE gateway_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gateway text NOT NULL DEFAULT 'RAZORPAY' CHECK (gateway = 'RAZORPAY'),
  gateway_event_id text NOT NULL,
  event_type text NOT NULL,
  signature_valid boolean NOT NULL,
  payload jsonb NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text,
  UNIQUE (gateway, gateway_event_id)
);

CREATE TABLE ranking_contributions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  amount_paise bigint NOT NULL CHECK (amount_paise <> 0),
  source text NOT NULL CHECK (source IN ('PAYMENT', 'PROMOTIONAL_CREDIT', 'REVERSAL')),
  payment_line_item_id uuid REFERENCES payment_line_items(id) ON DELETE RESTRICT,
  reason_code text,
  reversal_of_id uuid UNIQUE REFERENCES ranking_contributions(id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (source = 'PAYMENT' AND amount_paise > 0 AND payment_line_item_id IS NOT NULL AND reversal_of_id IS NULL)
    OR (source = 'PROMOTIONAL_CREDIT' AND amount_paise > 0 AND payment_line_item_id IS NULL AND reversal_of_id IS NULL AND reason_code IS NOT NULL)
    OR (source = 'REVERSAL' AND amount_paise < 0 AND reversal_of_id IS NOT NULL AND reason_code IS NOT NULL)
  )
);

CREATE INDEX entity_discovery_filters_entity_selected_idx ON entity_discovery_filters (entity_id, selected_at);
CREATE INDEX pending_checkouts_status_expires_idx ON pending_checkouts (status, expires_at);
CREATE INDEX pending_checkout_line_items_checkout_idx ON pending_checkout_line_items (pending_checkout_id);
CREATE INDEX payments_checkout_created_idx ON payments (pending_checkout_id, created_at DESC);
CREATE INDEX payments_entity_created_idx ON payments (entity_id, created_at DESC);
CREATE INDEX payment_line_items_payment_idx ON payment_line_items (payment_id);
CREATE INDEX city_listings_city_publication_idx ON city_listings (city_id, publication_status) WHERE unassigned_at IS NULL;
CREATE INDEX ranking_contributions_entity_created_idx ON ranking_contributions (entity_id, created_at, id);

COMMIT;
