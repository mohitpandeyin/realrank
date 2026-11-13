BEGIN;

CREATE FUNCTION rr_set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER owner_accounts_set_updated_at BEFORE UPDATE ON owner_accounts
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();
CREATE TRIGGER entities_set_updated_at BEFORE UPDATE ON entities
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();
CREATE TRIGGER entity_social_links_set_updated_at BEFORE UPDATE ON entity_social_links
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();
CREATE TRIGGER cities_set_updated_at BEFORE UPDATE ON cities
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();
CREATE TRIGGER pending_checkouts_set_updated_at BEFORE UPDATE ON pending_checkouts
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();
CREATE TRIGGER payments_set_updated_at BEFORE UPDATE ON payments
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();
CREATE TRIGGER city_listings_set_updated_at BEFORE UPDATE ON city_listings
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();
CREATE TRIGGER portfolio_project_details_set_updated_at BEFORE UPDATE ON portfolio_project_details
FOR EACH ROW EXECUTE FUNCTION rr_set_updated_at();

CREATE FUNCTION rr_enforce_discovery_filter_limit() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  selected_count integer;
BEGIN
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

CREATE TRIGGER entity_discovery_filter_limit
BEFORE INSERT OR UPDATE ON entity_discovery_filters
FOR EACH ROW EXECUTE FUNCTION rr_enforce_discovery_filter_limit();

CREATE FUNCTION rr_validate_city_slot_purchase() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  line_purpose text;
  line_entity uuid;
  payment_status text;
BEGIN
  IF NEW.entitlement_source = 'INCLUDED' THEN
    RETURN NEW;
  END IF;

  SELECT pli.purpose, pli.entity_id, p.status
    INTO line_purpose, line_entity, payment_status
  FROM payment_line_items pli
  JOIN payments p ON p.id = pli.payment_id
  WHERE pli.id = NEW.purchase_payment_line_item_id;

  IF line_purpose IS DISTINCT FROM 'CITY_SLOT_PURCHASE'
     OR line_entity IS DISTINCT FROM NEW.entity_id
     OR payment_status IS DISTINCT FROM 'CAPTURED' THEN
    RAISE EXCEPTION 'A paid city slot requires a captured CITY_SLOT_PURCHASE line item for the same entity';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER city_slot_purchase_valid
BEFORE INSERT OR UPDATE ON city_slots
FOR EACH ROW EXECUTE FUNCTION rr_validate_city_slot_purchase();

CREATE FUNCTION rr_validate_city_listing_slot() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  slot_entity uuid;
BEGIN
  SELECT entity_id INTO slot_entity FROM city_slots WHERE id = NEW.city_slot_id;
  IF slot_entity IS DISTINCT FROM NEW.entity_id THEN
    RAISE EXCEPTION 'The city slot and city listing must belong to the same entity';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER city_listing_slot_valid
BEFORE INSERT OR UPDATE ON city_listings
FOR EACH ROW EXECUTE FUNCTION rr_validate_city_listing_slot();

CREATE FUNCTION rr_validate_payment_transition() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  IF NOT (
    (OLD.status = 'ORDER_CREATED' AND NEW.status IN ('AUTHORIZED', 'CAPTURED', 'FAILED'))
    OR (OLD.status = 'AUTHORIZED' AND NEW.status IN ('CAPTURED', 'FAILED'))
    OR (OLD.status = 'CAPTURED' AND NEW.status IN ('PARTIALLY_REFUNDED', 'REFUNDED', 'CHARGEBACK'))
    OR (OLD.status = 'PARTIALLY_REFUNDED' AND NEW.status IN ('REFUNDED', 'CHARGEBACK'))
  ) THEN
    RAISE EXCEPTION 'Invalid payment status transition from % to %', OLD.status, NEW.status;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER payment_status_transition_valid
BEFORE UPDATE OF status ON payments
FOR EACH ROW EXECUTE FUNCTION rr_validate_payment_transition();

CREATE FUNCTION rr_validate_payment_allocation() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  allocated_paise bigint;
BEGIN
  IF NEW.status IN ('CAPTURED', 'PARTIALLY_REFUNDED', 'REFUNDED', 'CHARGEBACK') THEN
    SELECT COALESCE(sum(amount_paise), 0) INTO allocated_paise
    FROM payment_line_items WHERE payment_id = NEW.id;

    IF allocated_paise <> NEW.captured_gross_paise THEN
      RAISE EXCEPTION 'Captured payment % has % paise but line items allocate % paise', NEW.id, NEW.captured_gross_paise, allocated_paise;
    END IF;
  END IF;
  RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER payment_allocation_matches_capture
AFTER INSERT OR UPDATE OF status, captured_gross_paise ON payments
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION rr_validate_payment_allocation();

CREATE FUNCTION rr_validate_ranking_contribution() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  line_purpose text;
  line_entity uuid;
  payment_status text;
  original_amount bigint;
  original_entity uuid;
BEGIN
  IF NEW.source = 'PAYMENT' THEN
    SELECT pli.purpose, pli.entity_id, p.status
      INTO line_purpose, line_entity, payment_status
    FROM payment_line_items pli
    JOIN payments p ON p.id = pli.payment_id
    WHERE pli.id = NEW.payment_line_item_id;

    IF line_purpose IS DISTINCT FROM 'RANK_CONTRIBUTION'
       OR line_entity IS DISTINCT FROM NEW.entity_id
       OR payment_status IS DISTINCT FROM 'CAPTURED' THEN
      RAISE EXCEPTION 'A paid Rank contribution requires a captured RANK_CONTRIBUTION line item for the same entity';
    END IF;
  ELSIF NEW.source = 'REVERSAL' THEN
    SELECT amount_paise, entity_id INTO original_amount, original_entity
    FROM ranking_contributions WHERE id = NEW.reversal_of_id;

    IF original_entity IS DISTINCT FROM NEW.entity_id OR NEW.amount_paise <> -original_amount THEN
      RAISE EXCEPTION 'A Rank reversal must exactly reverse one contribution for the same entity';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ranking_contribution_valid
BEFORE INSERT ON ranking_contributions
FOR EACH ROW EXECUTE FUNCTION rr_validate_ranking_contribution();

CREATE FUNCTION rr_refresh_entity_rank_total() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  refreshed_total bigint;
BEGIN
  SELECT COALESCE(sum(amount_paise), 0) INTO refreshed_total
  FROM ranking_contributions
  WHERE entity_id = NEW.entity_id;

  IF refreshed_total < 0 THEN
    RAISE EXCEPTION 'Entity Rank total cannot be negative';
  END IF;

  UPDATE entities
  SET shared_total_ranking_credit_paise = refreshed_total,
      shared_total_reached_at = NEW.created_at
  WHERE id = NEW.entity_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ranking_contribution_refresh_total
AFTER INSERT ON ranking_contributions
FOR EACH ROW EXECUTE FUNCTION rr_refresh_entity_rank_total();

CREATE FUNCTION rr_block_ledger_mutation() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'Financial and Rank ledger rows are append-only';
END;
$$;

CREATE TRIGGER ranking_contributions_append_only
BEFORE UPDATE OR DELETE ON ranking_contributions
FOR EACH ROW EXECUTE FUNCTION rr_block_ledger_mutation();

CREATE TRIGGER payment_line_items_append_only
BEFORE UPDATE OR DELETE ON payment_line_items
FOR EACH ROW EXECUTE FUNCTION rr_block_ledger_mutation();

CREATE FUNCTION rr_validate_portfolio_item() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  category_code text;
  type_category_id uuid;
  type_supports_configuration boolean;
  kind_code text;
BEGIN
  IF NEW.primary_category_id IS NOT NULL THEN
    SELECT code INTO category_code FROM categories WHERE id = NEW.primary_category_id;
  END IF;

  IF NEW.property_type_id IS NOT NULL THEN
    SELECT category_id, supports_configuration
      INTO type_category_id, type_supports_configuration
    FROM property_types WHERE id = NEW.property_type_id;

    IF NEW.primary_category_id IS NULL OR type_category_id IS DISTINCT FROM NEW.primary_category_id THEN
      RAISE EXCEPTION 'Property type must belong to the selected primary category';
    END IF;
  END IF;

  IF category_code = 'RESIDENTIAL' AND NEW.listing_purpose = 'LEASE' THEN
    RAISE EXCEPTION 'Residential Lease is not an MVP listing-purpose combination';
  ELSIF category_code = 'LAND_PLOT' AND NEW.listing_purpose = 'RENT' THEN
    RAISE EXCEPTION 'Land & Plot Rent is not an MVP listing-purpose combination';
  END IF;

  IF NEW.residential_configuration_kind IS NOT NULL
     AND (category_code IS DISTINCT FROM 'RESIDENTIAL' OR type_supports_configuration IS NOT TRUE) THEN
    RAISE EXCEPTION 'RK/BHK configuration requires a supported Residential property type';
  END IF;

  IF category_code IS DISTINCT FROM 'LAND_PLOT'
     AND NEW.original_area_unit IN ('SQ_YD', 'ACRE', 'HECTARE') THEN
    RAISE EXCEPTION 'Built properties support only square feet or square metres';
  END IF;

  IF category_code = 'LAND_PLOT' AND NEW.area_type IS NOT NULL AND NEW.area_type <> 'PLOT' THEN
    RAISE EXCEPTION 'Land & Plot area type must be PLOT';
  END IF;

  IF NEW.item_kind_id IS NOT NULL THEN
    SELECT code INTO kind_code FROM portfolio_item_kinds WHERE id = NEW.item_kind_id;
  END IF;

  IF (NEW.auctioning_authority IS NOT NULL OR NEW.auction_at IS NOT NULL OR NEW.auction_reserve_price_label IS NOT NULL)
     AND kind_code IS DISTINCT FROM 'AUCTION' THEN
    RAISE EXCEPTION 'Auction fields require the AUCTION item kind';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER portfolio_item_valid
BEFORE INSERT OR UPDATE ON portfolio_items
FOR EACH ROW EXECUTE FUNCTION rr_validate_portfolio_item();

CREATE FUNCTION rr_validate_portfolio_item_city() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  item_entity uuid;
BEGIN
  SELECT entity_id INTO item_entity FROM portfolio_items WHERE id = NEW.portfolio_item_id;
  IF NOT EXISTS (
    SELECT 1 FROM city_listings
    WHERE entity_id = item_entity
      AND city_id = NEW.city_id
      AND publication_status = 'PUBLISHED'
      AND unassigned_at IS NULL
  ) THEN
    RAISE EXCEPTION 'A portfolio item city must be an active published city for its entity';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER portfolio_item_city_valid
BEFORE INSERT OR UPDATE ON portfolio_item_cities
FOR EACH ROW EXECUTE FUNCTION rr_validate_portfolio_item_city();

CREATE FUNCTION rr_validate_project_extension() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM portfolio_items pi
    JOIN portfolio_item_kinds pik ON pik.id = pi.item_kind_id
    WHERE pi.id = NEW.portfolio_item_id AND pik.code = 'PROJECT'
  ) THEN
    RAISE EXCEPTION 'Project extensions require a PROJECT portfolio item';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER portfolio_project_details_valid BEFORE INSERT OR UPDATE ON portfolio_project_details
FOR EACH ROW EXECUTE FUNCTION rr_validate_project_extension();
CREATE TRIGGER portfolio_project_configurations_valid BEFORE INSERT OR UPDATE ON portfolio_project_configurations
FOR EACH ROW EXECUTE FUNCTION rr_validate_project_extension();
CREATE TRIGGER portfolio_project_registrations_valid BEFORE INSERT OR UPDATE ON portfolio_project_registrations
FOR EACH ROW EXECUTE FUNCTION rr_validate_project_extension();
CREATE TRIGGER portfolio_project_amenities_valid BEFORE INSERT OR UPDATE ON portfolio_project_amenities
FOR EACH ROW EXECUTE FUNCTION rr_validate_project_extension();

CREATE FUNCTION rr_validate_land_use() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM portfolio_items pi
    JOIN categories c ON c.id = pi.primary_category_id
    JOIN property_types pt ON pt.id = pi.property_type_id
    WHERE pi.id = NEW.portfolio_item_id
      AND c.code = 'LAND_PLOT'
      AND pt.code = 'PLOT'
  ) THEN
    RAISE EXCEPTION 'Land-use rows require a Land & Plot item of type Plot / Land parcel';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER portfolio_item_land_use_valid
BEFORE INSERT OR UPDATE ON portfolio_item_land_uses
FOR EACH ROW EXECUTE FUNCTION rr_validate_land_use();

CREATE VIEW public_city_rankings WITH (security_invoker = true) AS
SELECT
  cl.city_id,
  cl.id AS city_listing_id,
  e.id AS entity_id,
  e.public_name,
  e.public_slug,
  e.shared_total_ranking_credit_paise,
  row_number() OVER (
    PARTITION BY cl.city_id
    ORDER BY e.shared_total_ranking_credit_paise DESC,
             GREATEST(e.shared_total_reached_at, cl.activated_at) ASC,
             cl.id ASC
  ) AS position
FROM city_listings cl
JOIN entities e ON e.id = cl.entity_id
WHERE cl.publication_status = 'PUBLISHED'
  AND cl.unassigned_at IS NULL
  AND e.publication_status = 'PUBLISHED'
  AND e.moderation_status = 'APPROVED';

CREATE VIEW public_city_filter_rankings WITH (security_invoker = true) AS
SELECT
  cl.city_id,
  edf.discovery_filter_id,
  cl.id AS city_listing_id,
  e.id AS entity_id,
  e.public_name,
  e.public_slug,
  e.shared_total_ranking_credit_paise,
  row_number() OVER (
    PARTITION BY cl.city_id, edf.discovery_filter_id
    ORDER BY e.shared_total_ranking_credit_paise DESC,
             GREATEST(e.shared_total_reached_at, cl.activated_at, edf.selected_at) ASC,
             cl.id ASC
  ) AS position
FROM city_listings cl
JOIN entities e ON e.id = cl.entity_id
JOIN entity_discovery_filters edf ON edf.entity_id = e.id
WHERE cl.publication_status = 'PUBLISHED'
  AND cl.unassigned_at IS NULL
  AND e.publication_status = 'PUBLISHED'
  AND e.moderation_status = 'APPROVED';

CREATE VIEW public_portfolio_items WITH (security_invoker = true) AS
SELECT pi.*
FROM portfolio_items pi
JOIN entities e ON e.id = pi.entity_id
WHERE pi.publication_status = 'PUBLISHED'
  AND pi.moderation_status = 'APPROVED'
  AND e.publication_status = 'PUBLISHED'
  AND e.moderation_status = 'APPROVED';

CREATE INDEX entities_public_rank_idx
  ON entities (shared_total_ranking_credit_paise DESC, shared_total_reached_at, id)
  WHERE publication_status = 'PUBLISHED' AND moderation_status = 'APPROVED';
CREATE INDEX entities_name_trgm_idx ON entities USING gin (public_name gin_trgm_ops);
CREATE INDEX cities_name_trgm_idx ON cities USING gin (canonical_name gin_trgm_ops);
CREATE INDEX city_aliases_normalized_trgm_idx ON city_aliases USING gin (normalized_alias gin_trgm_ops) WHERE is_active;
CREATE INDEX portfolio_items_title_trgm_idx ON portfolio_items USING gin (title gin_trgm_ops) WHERE publication_status = 'PUBLISHED';

ALTER TABLE owner_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE city_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE entity_discovery_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_checkouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_checkout_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gateway_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ranking_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_project_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_project_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_project_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_project_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_specialisations ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_land_uses ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_item_tags ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE ranking_contributions IS 'Append-only Rank ledger. Reverse by inserting one negative REVERSAL row; never update or delete.';
COMMENT ON COLUMN entities.shared_total_ranking_credit_paise IS 'Transactionally maintained cache of the ranking_contributions sum; not the financial source of truth.';
COMMENT ON VIEW public_city_rankings IS 'Entity sponsored positions within a city. Position is not a quality score or recommendation.';
COMMENT ON TABLE portfolio_project_registrations IS 'Supplied or sourced registration facts; presence does not by itself mean Realrank verification.';

COMMIT;
