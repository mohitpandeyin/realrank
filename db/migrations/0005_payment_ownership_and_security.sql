BEGIN;

-- One captured allocation can create at most one Rank contribution, and the
-- current checkout model allows one allocation per purpose.
CREATE UNIQUE INDEX ranking_contributions_payment_line_unique
  ON ranking_contributions (payment_line_item_id)
  WHERE source = 'PAYMENT';

CREATE UNIQUE INDEX payment_line_items_payment_purpose_unique
  ON payment_line_items (payment_id, purpose);

-- Rank totals are a cache of the immutable contribution ledger. Delta updates
-- serialize on the entity row and cannot lose a concurrent contribution.
WITH ledger_totals AS (
  SELECT
    e.id AS entity_id,
    COALESCE(sum(rc.amount_paise), 0) AS total_paise,
    max(rc.created_at) AS reached_at
  FROM entities e
  LEFT JOIN ranking_contributions rc ON rc.entity_id = e.id
  GROUP BY e.id
)
UPDATE entities e
SET shared_total_ranking_credit_paise = lt.total_paise,
    shared_total_reached_at = CASE WHEN lt.total_paise = 0 THEN NULL ELSE lt.reached_at END
FROM ledger_totals lt
WHERE lt.entity_id = e.id;

CREATE OR REPLACE FUNCTION rr_refresh_entity_rank_total() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  refreshed_total bigint;
BEGIN
  UPDATE entities
  SET shared_total_ranking_credit_paise = shared_total_ranking_credit_paise + NEW.amount_paise,
      shared_total_reached_at = NEW.created_at
  WHERE id = NEW.entity_id
    AND shared_total_ranking_credit_paise + NEW.amount_paise >= 0
  RETURNING shared_total_ranking_credit_paise INTO refreshed_total;

  IF refreshed_total IS NULL THEN
    RAISE EXCEPTION 'Entity Rank total cannot be negative or entity does not exist';
  END IF;

  RETURN NEW;
END;
$$;

-- Checkout state only moves forward. A new attempt uses a new payment/order,
-- not a backwards status mutation.
CREATE FUNCTION rr_validate_pending_checkout_transition() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'CREATED' AND NEW.status IN ('ORDERED', 'CANCELLED', 'EXPIRED'))
    OR (OLD.status = 'ORDERED' AND NEW.status IN ('PAYMENT_PENDING', 'CAPTURED', 'FAILED', 'CANCELLED', 'EXPIRED'))
    OR (OLD.status = 'PAYMENT_PENDING' AND NEW.status IN ('CAPTURED', 'FAILED', 'CANCELLED', 'EXPIRED'))
  ) THEN
    RAISE EXCEPTION 'Invalid pending checkout status transition from % to %', OLD.status, NEW.status;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER pending_checkout_status_transition_valid
BEFORE UPDATE OF status ON pending_checkouts
FOR EACH ROW EXECUTE FUNCTION rr_validate_pending_checkout_transition();

-- The browser receives only the random bearer token. PostgreSQL stores its
-- digest, expiry and one-time consumption state.
CREATE TABLE payment_success_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE RESTRICT,
  phone_e164 text NOT NULL CHECK (phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  token_hash text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'CONSUMED', 'EXPIRED', 'REVOKED')),
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (expires_at > created_at),
  CHECK ((status = 'CONSUMED') = (consumed_at IS NOT NULL))
);

CREATE UNIQUE INDEX payment_success_sessions_active_payment_unique
  ON payment_success_sessions (payment_id)
  WHERE status = 'ACTIVE';

CREATE INDEX payment_success_sessions_entity_status_idx
  ON payment_success_sessions (entity_id, status);

CREATE TRIGGER payment_success_sessions_set_updated_at
BEFORE UPDATE ON payment_success_sessions
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();

ALTER TABLE payment_success_sessions ENABLE ROW LEVEL SECURITY;

-- Owner numbers are verified identities. Public contact numbers may be edited
-- as drafts, but changing the number clears the old verification timestamp.
CREATE FUNCTION rr_validate_owner_phone_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.verified_phone_e164 IS DISTINCT FROM OLD.verified_phone_e164
     AND NEW.verified_phone_e164 IS NOT NULL
     AND (
       NEW.phone_verified_at IS NULL
       OR NEW.phone_verified_at IS NOT DISTINCT FROM OLD.phone_verified_at
     ) THEN
    RAISE EXCEPTION 'Changing an owner phone requires a new completed verification';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER owner_phone_change_requires_verification
BEFORE UPDATE OF verified_phone_e164, phone_verified_at ON owner_accounts
FOR EACH ROW EXECUTE FUNCTION rr_validate_owner_phone_change();

CREATE FUNCTION rr_invalidate_entity_contact_verification() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.contact_phone_e164 IS DISTINCT FROM OLD.contact_phone_e164
     AND NEW.contact_phone_verified_at IS NOT DISTINCT FROM OLD.contact_phone_verified_at THEN
    NEW.contact_phone_verified_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER entity_contact_change_invalidates_verification
BEFORE UPDATE OF contact_phone_e164, contact_phone_verified_at ON entities
FOR EACH ROW EXECUTE FUNCTION rr_invalidate_entity_contact_verification();

ALTER TABLE city_listings
  ADD COLUMN contact_phone_verified_at_override timestamptz,
  ADD CONSTRAINT city_listing_contact_override_verified
    CHECK ((contact_phone_e164_override IS NULL) = (contact_phone_verified_at_override IS NULL));

CREATE FUNCTION rr_validate_city_contact_change() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.contact_phone_e164_override IS DISTINCT FROM OLD.contact_phone_e164_override
     AND NEW.contact_phone_e164_override IS NOT NULL
     AND (
       NEW.contact_phone_verified_at_override IS NULL
       OR NEW.contact_phone_verified_at_override IS NOT DISTINCT FROM OLD.contact_phone_verified_at_override
     ) THEN
    RAISE EXCEPTION 'Changing a city contact override requires a new completed verification';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER city_contact_change_requires_verification
BEFORE UPDATE OF contact_phone_e164_override, contact_phone_verified_at_override ON city_listings
FOR EACH ROW EXECUTE FUNCTION rr_validate_city_contact_change();

-- Expression uniqueness closes the nullable-district and case-variation gaps
-- without changing established city IDs or slugs.
CREATE UNIQUE INDEX cities_normalized_identity_unique
  ON cities (
    lower(btrim(canonical_name)),
    upper(btrim(state_code)),
    COALESCE(lower(btrim(district_code)), '')
  );

-- Serialize discovery-membership changes on the owning entity before counting
-- the fixed maximum of three selections.
CREATE OR REPLACE FUNCTION rr_enforce_discovery_filter_limit() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  selected_count integer;
BEGIN
  PERFORM 1 FROM entities WHERE id = NEW.entity_id FOR UPDATE;

  SELECT count(*) INTO selected_count
  FROM entity_discovery_filters
  WHERE entity_id = NEW.entity_id
    AND discovery_filter_id <> NEW.discovery_filter_id;

  IF selected_count >= 3 THEN
    RAISE EXCEPTION 'An entity may select at most three discovery filters';
  END IF;
  RETURN NEW;
END;
$$;

-- Public views use an explicit allowlist so future private columns cannot leak
-- merely because they were added to the source table.
DROP VIEW public_portfolio_items;

CREATE VIEW public_portfolio_items WITH (security_invoker = true) AS
SELECT
  pi.id,
  pi.entity_id,
  pi.item_kind_id,
  pi.title,
  pi.public_slug,
  pi.featured_order,
  pi.primary_category_id,
  pi.property_type_id,
  pi.listing_purpose,
  pi.classification_status,
  pi.residential_configuration_kind,
  pi.residential_room_count,
  pi.residential_room_count_plus,
  pi.furnishing_status,
  pi.original_area_value,
  pi.original_area_unit,
  pi.canonical_area_sqm,
  pi.area_type,
  pi.price_amount_paise,
  pi.price_context,
  pi.locality,
  pi.description,
  pi.external_url,
  pi.auctioning_authority,
  pi.auction_source_url,
  pi.auction_at,
  pi.auction_reserve_price_label,
  pi.auction_facts_confirmed_at,
  pi.published_at,
  pi.last_updated_at
FROM portfolio_items pi
JOIN entities e ON e.id = pi.entity_id
WHERE pi.publication_status = 'PUBLISHED'
  AND pi.moderation_status = 'APPROVED'
  AND e.publication_status = 'PUBLISHED'
  AND e.moderation_status = 'APPROVED';

COMMENT ON TABLE gateway_webhook_events IS
  'Webhook idempotency gate. UNIQUE (gateway, gateway_event_id) is established in migration 0002.';
COMMENT ON COLUMN entities.shared_total_reached_at IS
  'Database contribution timestamp used in deterministic rank ties; never supplied by the browser.';
COMMENT ON TABLE payment_success_sessions IS
  'Short-lived one-time ownership-onboarding sessions. Store a bearer-token digest, never the token.';

COMMIT;
