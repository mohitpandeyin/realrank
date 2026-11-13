\set ON_ERROR_STOP on

DO $$
DECLARE
  actual bigint;
  expected bigint;
BEGIN
  SELECT count(*) INTO actual FROM discovery_filters;
  IF actual <> 13 THEN RAISE EXCEPTION 'Expected 13 discovery filters, found %', actual; END IF;

  SELECT count(*) INTO actual FROM entities WHERE publication_status = 'PUBLISHED';
  IF actual <> 7 THEN RAISE EXCEPTION 'Expected 7 published entity fixtures, found %', actual; END IF;

  SELECT count(*) INTO actual FROM pending_checkout_line_items;
  IF actual <> 7 THEN RAISE EXCEPTION 'Expected one quoted line item for each captured fixture, found %', actual; END IF;

  SELECT count(*) INTO actual FROM public_portfolio_items;
  IF actual <> 6 THEN RAISE EXCEPTION 'Expected 6 public portfolio fixtures, found %', actual; END IF;

  SELECT count(*) INTO actual FROM public_portfolio_items WHERE id IN (
    '40000000-0000-4000-8000-000000000007',
    '40000000-0000-4000-8000-000000000008'
  );
  IF actual <> 0 THEN RAISE EXCEPTION 'Withdrawn and draft items leaked into public_portfolio_items'; END IF;

  SELECT shared_total_ranking_credit_paise INTO actual
  FROM entities WHERE id = '20000000-0000-4000-8000-000000000001';
  IF actual <> 126000 THEN RAISE EXCEPTION 'Aarambh cached Rank total is %, expected 126000', actual; END IF;

  SELECT COALESCE(sum(amount_paise), 0) INTO expected
  FROM ranking_contributions WHERE entity_id = '20000000-0000-4000-8000-000000000001';
  IF actual <> expected THEN RAISE EXCEPTION 'Cached Rank total does not reconcile with the ledger'; END IF;

  SELECT position INTO actual FROM public_city_rankings
  WHERE city_id = '10000000-0000-4000-8000-000000000001'
    AND entity_id = '20000000-0000-4000-8000-000000000001';
  IF actual <> 3 THEN RAISE EXCEPTION 'Aarambh should be Indore #3, found #% ', actual; END IF;

  SELECT position INTO actual FROM public_city_rankings
  WHERE city_id = '10000000-0000-4000-8000-000000000002'
    AND entity_id = '20000000-0000-4000-8000-000000000001';
  IF actual <> 1 THEN RAISE EXCEPTION 'Aarambh should be Bhopal #1, found #% ', actual; END IF;

  SELECT position INTO actual FROM public_city_rankings
  WHERE city_id = '10000000-0000-4000-8000-000000000001'
    AND entity_id = '20000000-0000-4000-8000-000000000006';
  IF actual <> 6 THEN RAISE EXCEPTION 'Earlier tied entity should be Indore #6, found #% ', actual; END IF;

  SELECT position INTO actual FROM public_city_rankings
  WHERE city_id = '10000000-0000-4000-8000-000000000001'
    AND entity_id = '20000000-0000-4000-8000-000000000007';
  IF actual <> 7 THEN RAISE EXCEPTION 'Later tied entity should be Indore #7, found #% ', actual; END IF;

  SELECT count(*) INTO actual FROM portfolio_item_media
  WHERE portfolio_item_id = '40000000-0000-4000-8000-000000000003';
  IF actual <> 0 THEN RAISE EXCEPTION 'Long-title fixture must retain its missing-media state'; END IF;

  SELECT count(*) INTO actual FROM pg_class
  WHERE relname IN ('owner_accounts', 'entities', 'payments', 'ranking_contributions', 'portfolio_items')
    AND relrowsecurity;
  IF actual <> 5 THEN RAISE EXCEPTION 'Expected RLS on core private tables'; END IF;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id)
    SELECT '20000000-0000-4000-8000-000000000001', id
    FROM discovery_filters WHERE code = 'AUCTION_PROPERTIES';
    RAISE EXCEPTION 'TEST_EXPECTED_FILTER_LIMIT';
  EXCEPTION WHEN others THEN
    IF SQLERRM = 'TEST_EXPECTED_FILTER_LIMIT' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'An entity may select at most three discovery filters%' THEN RAISE; END IF;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    INSERT INTO portfolio_items (
      entity_id, item_kind_id, title, public_slug, primary_category_id, property_type_id,
      listing_purpose, publication_status, moderation_status
    ) VALUES (
      '20000000-0000-4000-8000-000000000001',
      (SELECT id FROM portfolio_item_kinds WHERE code = 'PROPERTY'),
      'Invalid Residential lease fixture', 'invalid-residential-lease',
      (SELECT id FROM categories WHERE code = 'RESIDENTIAL'),
      (SELECT id FROM property_types WHERE code = 'APARTMENT'),
      'LEASE', 'DRAFT', 'PENDING'
    );
    RAISE EXCEPTION 'TEST_EXPECTED_PURPOSE_FAILURE';
  EXCEPTION WHEN others THEN
    IF SQLERRM = 'TEST_EXPECTED_PURPOSE_FAILURE' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'Residential Lease is not an MVP%' THEN RAISE; END IF;
  END;
END;
$$;

DO $$
BEGIN
  BEGIN
    UPDATE ranking_contributions SET reason_code = 'not allowed'
    WHERE id = md5('rank:20000000-0000-4000-8000-000000000001')::uuid;
    RAISE EXCEPTION 'TEST_EXPECTED_LEDGER_FAILURE';
  EXCEPTION WHEN others THEN
    IF SQLERRM = 'TEST_EXPECTED_LEDGER_FAILURE' THEN RAISE; END IF;
    IF SQLERRM NOT LIKE 'Financial and Rank ledger rows are append-only%' THEN RAISE; END IF;
  END;
END;
$$;

SELECT 'Realrank schema smoke checks passed' AS result;
