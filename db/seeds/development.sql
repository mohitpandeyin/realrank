\set ON_ERROR_STOP on

BEGIN;

CREATE TEMP TABLE rr_fixture_rank_totals (
  entity_id uuid PRIMARY KEY,
  total_paise bigint NOT NULL,
  reached_at timestamptz NOT NULL
) ON COMMIT DROP;

INSERT INTO owner_accounts (id, auth_user_id, verified_phone_e164, phone_verified_at) VALUES
  ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-9000-000000000001', '+919999999991', '2026-10-01 09:00:00+05:30'),
  ('00000000-0000-4000-8000-000000000002', '00000000-0000-4000-9000-000000000002', '+919999999992', '2026-10-02 09:00:00+05:30'),
  ('00000000-0000-4000-8000-000000000003', '00000000-0000-4000-9000-000000000003', '+919999999993', '2026-10-03 09:00:00+05:30');

INSERT INTO cities (id, canonical_name, state_name, state_code, district_name, slug, realrank_status, first_live_at) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Indore', 'Madhya Pradesh', 'MP', 'Indore', 'indore', 'LIVE', '2026-08-01 10:00:00+05:30'),
  ('10000000-0000-4000-8000-000000000002', 'Bhopal', 'Madhya Pradesh', 'MP', 'Bhopal', 'bhopal', 'LIVE', '2026-09-15 10:00:00+05:30'),
  ('10000000-0000-4000-8000-000000000003', 'Ujjain', 'Madhya Pradesh', 'MP', 'Ujjain', 'ujjain', 'UNOPENED', NULL),
  ('10000000-0000-4000-8000-000000000004', 'Jaipur', 'Rajasthan', 'RJ', 'Jaipur', 'jaipur', 'EMPTY', '2026-09-01 10:00:00+05:30');

INSERT INTO city_aliases (city_id, alias, normalized_alias, alias_type) VALUES
  ('10000000-0000-4000-8000-000000000001', 'Indore', 'indore', 'COMMON'),
  ('10000000-0000-4000-8000-000000000002', 'Bhopal', 'bhopal', 'COMMON'),
  ('10000000-0000-4000-8000-000000000003', 'Ujjain', 'ujjain', 'COMMON'),
  ('10000000-0000-4000-8000-000000000004', 'Jaipur', 'jaipur', 'COMMON');

INSERT INTO entities (
  id, owner_account_id, public_name, public_slug, short_description, logo_object_key, website_url,
  contact_method, contact_phone_e164, contact_phone_verified_at, publication_status, moderation_status, created_at
) VALUES
  ('20000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Aarambh Realty', 'aarambh-realty', 'Residential and commercial property marketing with a curated portfolio of current opportunities.', 'fixtures/entities/aarambh/logo.webp', 'https://aarambh.example.invalid', 'WHATSAPP', '+919999999991', '2026-10-01 09:00:00+05:30', 'PUBLISHED', 'APPROVED', '2026-08-10 10:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000002', NULL, 'Apollo Realty', 'apollo-realty', 'Residential and commercial property marketing across current opportunities.', 'fixtures/entities/apollo/logo.webp', NULL, 'WHATSAPP', '+919999999982', '2026-08-11 10:00:00+05:30', 'PUBLISHED', 'APPROVED', '2026-08-11 10:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000003', NULL, 'Indore Spaces', 'indore-spaces', 'Curated plots and residential opportunities.', NULL, NULL, 'CALL', '+919999999983', NULL, 'PUBLISHED', 'APPROVED', '2026-08-12 10:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000004', NULL, 'MP Property Hub', 'mp-property-hub', 'Commercial spaces and managed rentals for growing businesses.', NULL, NULL, 'WHATSAPP', '+919999999984', NULL, 'PUBLISHED', 'APPROVED', '2026-08-13 10:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000005', NULL, 'Shree Siddhivinayak Warehousing and Industrial Property Advisors', 'shree-siddhivinayak-warehousing-industrial-property-advisors', NULL, NULL, NULL, 'CALL', '+919999999985', NULL, 'PUBLISHED', 'APPROVED', '2026-08-14 10:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000006', NULL, 'Equal Rank Estates', 'equal-rank-estates', NULL, NULL, NULL, 'CALL', '+919999999986', NULL, 'PUBLISHED', 'APPROVED', '2026-08-15 10:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000007', NULL, 'Equal Rank Realty', 'equal-rank-realty', NULL, NULL, NULL, 'CALL', '+919999999987', NULL, 'PUBLISHED', 'APPROVED', '2026-08-16 10:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000002', 'Draft Entity', 'draft-entity', NULL, NULL, NULL, 'WHATSAPP', '+919999999992', NULL, 'DRAFT', 'PENDING', '2026-10-02 10:00:00+05:30');

INSERT INTO rr_fixture_rank_totals (entity_id, total_paise, reached_at) VALUES
  ('20000000-0000-4000-8000-000000000001', 126000, '2026-10-01 11:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000002', 185000, '2026-09-01 11:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000003', 145000, '2026-09-02 11:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000004', 84000, '2026-09-03 11:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000005', 51000, '2026-09-04 11:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000006', 30000, '2026-09-05 11:00:00+05:30'),
  ('20000000-0000-4000-8000-000000000007', 30000, '2026-09-06 11:00:00+05:30');

INSERT INTO entity_social_links (entity_id, platform, public_label, url, display_order) VALUES
  ('20000000-0000-4000-8000-000000000001', 'INSTAGRAM', '@aarambhrealty', 'https://instagram.com/aarambhrealty', 1);

INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id, selected_at)
SELECT '20000000-0000-4000-8000-000000000001', id, '2026-08-10 10:00:00+05:30' FROM discovery_filters WHERE code IN ('RESIDENTIAL', 'COMMERCIAL', 'NEW_PROJECTS');
INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id, selected_at)
SELECT '20000000-0000-4000-8000-000000000002', id, '2026-08-11 10:00:00+05:30' FROM discovery_filters WHERE code IN ('RESIDENTIAL', 'COMMERCIAL');
INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id, selected_at)
SELECT '20000000-0000-4000-8000-000000000003', id, '2026-08-12 10:00:00+05:30' FROM discovery_filters WHERE code IN ('RESIDENTIAL', 'LAND_PLOT');
INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id, selected_at)
SELECT '20000000-0000-4000-8000-000000000004', id, '2026-08-13 10:00:00+05:30' FROM discovery_filters WHERE code IN ('COMMERCIAL', 'RENTALS');
INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id, selected_at)
SELECT '20000000-0000-4000-8000-000000000005', id, '2026-08-14 10:00:00+05:30' FROM discovery_filters WHERE code IN ('COMMERCIAL', 'INDUSTRIAL', 'WAREHOUSES');
INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id, selected_at)
SELECT e.id, df.id, e.created_at FROM entities e CROSS JOIN discovery_filters df
WHERE e.id IN ('20000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000007') AND df.code = 'RESIDENTIAL';

INSERT INTO pending_checkouts (id, entity_id, requested_city_id, intent, status, idempotency_key, expires_at, created_at)
SELECT md5('checkout:' || entity_id::text)::uuid, entity_id, '10000000-0000-4000-8000-000000000001', 'NEW_ENTITY', 'CAPTURED', 'fixture-checkout-' || entity_id::text, reached_at + interval '1 day', reached_at
FROM rr_fixture_rank_totals;

INSERT INTO pending_checkout_line_items (
  id, pending_checkout_id, purpose, entity_id, requested_city_id, target_position,
  quoted_competitor_total_paise, amount_paise, quote_expires_at, created_at
)
SELECT md5('quote-line:' || entity_id::text)::uuid, md5('checkout:' || entity_id::text)::uuid,
       'RANK_CONTRIBUTION', entity_id, '10000000-0000-4000-8000-000000000001', 1,
       GREATEST(total_paise - 100, 0), total_paise, reached_at + interval '15 minutes', reached_at
FROM rr_fixture_rank_totals;

INSERT INTO payments (id, pending_checkout_id, entity_id, gateway_order_id, gateway_payment_id, captured_gross_paise, status, captured_at, created_at)
SELECT md5('payment:' || entity_id::text)::uuid, md5('checkout:' || entity_id::text)::uuid, entity_id,
       'order_fixture_' || replace(entity_id::text, '-', ''), 'pay_fixture_' || replace(entity_id::text, '-', ''),
       total_paise, 'CAPTURED', reached_at, reached_at
FROM rr_fixture_rank_totals;

INSERT INTO payment_line_items (id, payment_id, purpose, entity_id, requested_city_id, amount_paise, allocation_reference, created_at)
SELECT md5('line:' || entity_id::text)::uuid, md5('payment:' || entity_id::text)::uuid, 'RANK_CONTRIBUTION', entity_id,
       '10000000-0000-4000-8000-000000000001', total_paise, 'fixture-rank-' || entity_id::text, reached_at
FROM rr_fixture_rank_totals;

INSERT INTO ranking_contributions (id, entity_id, amount_paise, source, payment_line_item_id, created_at)
SELECT md5('rank:' || entity_id::text)::uuid, entity_id, total_paise, 'PAYMENT', md5('line:' || entity_id::text)::uuid, reached_at
FROM rr_fixture_rank_totals ORDER BY reached_at;

INSERT INTO city_slots (id, entity_id, slot_number, entitlement_source)
SELECT md5('slot:' || e.id::text || ':' || n)::uuid, e.id, n, 'INCLUDED'
FROM entities e CROSS JOIN generate_series(1, 3) AS n;

INSERT INTO city_listings (id, entity_id, city_slot_id, city_id, assigned_at, activated_at, publication_status) VALUES
  ('30000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', md5('slot:20000000-0000-4000-8000-000000000001:1')::uuid, '10000000-0000-4000-8000-000000000002', '2026-09-15 10:00:00+05:30', '2026-09-15 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', md5('slot:20000000-0000-4000-8000-000000000001:2')::uuid, '10000000-0000-4000-8000-000000000001', '2026-10-01 10:00:00+05:30', '2026-10-01 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000002', md5('slot:20000000-0000-4000-8000-000000000002:1')::uuid, '10000000-0000-4000-8000-000000000001', '2026-08-11 10:00:00+05:30', '2026-08-11 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000003', md5('slot:20000000-0000-4000-8000-000000000003:1')::uuid, '10000000-0000-4000-8000-000000000001', '2026-08-12 10:00:00+05:30', '2026-08-12 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000004', md5('slot:20000000-0000-4000-8000-000000000004:1')::uuid, '10000000-0000-4000-8000-000000000001', '2026-08-13 10:00:00+05:30', '2026-08-13 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000004', md5('slot:20000000-0000-4000-8000-000000000004:2')::uuid, '10000000-0000-4000-8000-000000000002', '2026-09-20 10:00:00+05:30', '2026-09-20 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000005', md5('slot:20000000-0000-4000-8000-000000000005:1')::uuid, '10000000-0000-4000-8000-000000000001', '2026-08-14 10:00:00+05:30', '2026-08-14 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000006', md5('slot:20000000-0000-4000-8000-000000000006:1')::uuid, '10000000-0000-4000-8000-000000000001', '2026-08-15 10:00:00+05:30', '2026-08-15 10:00:00+05:30', 'PUBLISHED'),
  ('30000000-0000-4000-8000-000000000009', '20000000-0000-4000-8000-000000000007', md5('slot:20000000-0000-4000-8000-000000000007:1')::uuid, '10000000-0000-4000-8000-000000000001', '2026-08-16 10:00:00+05:30', '2026-08-16 10:00:00+05:30', 'PUBLISHED');

INSERT INTO portfolio_items (
  id, entity_id, item_kind_id, title, public_slug, featured_order, primary_category_id, property_type_id,
  listing_purpose, classification_source, classification_status, classification_confirmed_at,
  residential_configuration_kind, residential_room_count, original_area_value, original_area_unit,
  canonical_area_sqm, area_type, price_amount_paise, price_context, locality, description,
  publication_status, moderation_status, published_at, last_updated_at,
  auctioning_authority, auction_source_url, auction_at, auction_reserve_price_label, auction_facts_confirmed_at
) VALUES
  ('40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', (SELECT id FROM portfolio_item_kinds WHERE code='PROJECT'), 'Aarambh Heights', 'aarambh-heights', 1, (SELECT id FROM categories WHERE code='RESIDENTIAL'), (SELECT id FROM property_types WHERE code='APARTMENT'), 'SALE', 'USER_SELECTED', 'CONFIRMED', '2026-10-05 10:00:00+05:30', 'BHK', 2, 1050, 'SQ_FT', 97.548192, 'CARPET', 620000000, 'TOTAL', 'Hoshangabad Road', 'A residential project with 2 and 3 BHK homes and an approximate public location.', 'PUBLISHED', 'APPROVED', '2026-10-05 10:00:00+05:30', '2026-11-08 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000002', '20000000-0000-4000-8000-000000000001', (SELECT id FROM portfolio_item_kinds WHERE code='COLLECTION'), 'MP Nagar office collection', 'mp-nagar-office-collection', 2, (SELECT id FROM categories WHERE code='COMMERCIAL'), (SELECT id FROM property_types WHERE code='OFFICE'), 'LEASE', 'USER_SELECTED', 'CONFIRMED', '2026-10-06 10:00:00+05:30', NULL, NULL, 1800, 'SQ_FT', 167.225472, 'BUILT_UP', 8500000, 'MONTH', 'MP Nagar', 'Selected commercial office opportunities for growing teams and investors.', 'PUBLISHED', 'APPROVED', '2026-10-06 10:00:00+05:30', '2026-11-08 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000003', '20000000-0000-4000-8000-000000000001', (SELECT id FROM portfolio_item_kinds WHERE code='PROPERTY'), 'Vijay Nagar residential selection with an intentionally long public title', 'vijay-nagar-residential-selection', 3, (SELECT id FROM categories WHERE code='RESIDENTIAL'), (SELECT id FROM property_types WHERE code='INDEPENDENT_HOUSE'), 'SALE', 'USER_SELECTED', 'CONFIRMED', '2026-10-07 10:00:00+05:30', 'BHK', 4, 2400, 'SQ_FT', 222.967296, 'BUILT_UP', 1450000000, 'TOTAL', 'Vijay Nagar', 'A missing-media fixture for narrow layouts and fallback rendering.', 'PUBLISHED', 'APPROVED', '2026-10-07 10:00:00+05:30', '2026-11-06 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000004', '20000000-0000-4000-8000-000000000001', (SELECT id FROM portfolio_item_kinds WHERE code='PROPERTY'), 'Rau mixed-use land parcel', 'rau-mixed-use-land-parcel', NULL, (SELECT id FROM categories WHERE code='LAND_PLOT'), (SELECT id FROM property_types WHERE code='PLOT'), 'SALE', 'USER_SELECTED', 'CONFIRMED', '2026-10-08 10:00:00+05:30', NULL, NULL, 1200, 'SQ_YD', 1003.354838, 'PLOT', NULL, NULL, 'Rau', 'Mixed residential and commercial use parcel fixture.', 'PUBLISHED', 'APPROVED', '2026-10-08 10:00:00+05:30', '2026-11-05 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000005', '20000000-0000-4000-8000-000000000001', (SELECT id FROM portfolio_item_kinds WHERE code='AUCTION'), 'Bank auction opportunity', 'bank-auction-opportunity', NULL, (SELECT id FROM categories WHERE code='COMMERCIAL'), (SELECT id FROM property_types WHERE code='SHOWROOM'), 'SALE', 'USER_SELECTED', 'CONFIRMED', '2026-10-09 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indore', 'Entity-supplied auction opportunity; Realrank does not conduct the auction.', 'PUBLISHED', 'APPROVED', '2026-10-09 10:00:00+05:30', '2026-11-04 10:00:00+05:30', 'Example Bank', 'https://bank.example.invalid/auction/fixture', '2026-12-15 11:00:00+05:30', 'Reserve price available from source', '2026-11-04 10:00:00+05:30'),
  ('40000000-0000-4000-8000-000000000006', '20000000-0000-4000-8000-000000000003', NULL, 'Unclassified opportunity', 'unclassified-opportunity', NULL, NULL, NULL, NULL, NULL, 'UNCLASSIFIED', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Indore', 'A simple portfolio post that can be classified later.', 'PUBLISHED', 'APPROVED', '2026-10-10 10:00:00+05:30', '2026-11-03 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000007', '20000000-0000-4000-8000-000000000001', (SELECT id FROM portfolio_item_kinds WHERE code='PROJECT'), 'Unavailable project', 'unavailable-project', NULL, (SELECT id FROM categories WHERE code='RESIDENTIAL'), (SELECT id FROM property_types WHERE code='APARTMENT'), 'SALE', 'USER_SELECTED', 'CONFIRMED', '2026-10-11 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Withdrawn public-state fixture.', 'WITHDRAWN', 'APPROVED', NULL, '2026-11-02 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL),
  ('40000000-0000-4000-8000-000000000008', '20000000-0000-4000-8000-000000000008', (SELECT id FROM portfolio_item_kinds WHERE code='PROPERTY'), 'Draft portfolio item', 'draft-portfolio-item', NULL, (SELECT id FROM categories WHERE code='RESIDENTIAL'), (SELECT id FROM property_types WHERE code='APARTMENT'), 'RENT', 'USER_SELECTED', 'NEEDS_CONFIRMATION', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'Owner-only draft fixture.', 'DRAFT', 'PENDING', NULL, '2026-11-01 10:00:00+05:30', NULL, NULL, NULL, NULL, NULL);

INSERT INTO portfolio_item_cities (portfolio_item_id, city_id, is_primary) VALUES
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', true),
  ('40000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', false),
  ('40000000-0000-4000-8000-000000000002', '10000000-0000-4000-8000-000000000002', true),
  ('40000000-0000-4000-8000-000000000003', '10000000-0000-4000-8000-000000000001', true),
  ('40000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000001', true),
  ('40000000-0000-4000-8000-000000000005', '10000000-0000-4000-8000-000000000001', true),
  ('40000000-0000-4000-8000-000000000006', '10000000-0000-4000-8000-000000000001', true);

INSERT INTO portfolio_item_media (portfolio_item_id, storage_object_key, display_order, media_role, alt_text, width_px, height_px, mime_type, moderation_status) VALUES
  ('40000000-0000-4000-8000-000000000001', 'fixtures/portfolio/aarambh-heights/cover.webp', 1, 'COVER', 'Aarambh Heights residential project exterior', 1600, 900, 'image/webp', 'APPROVED'),
  ('40000000-0000-4000-8000-000000000001', 'fixtures/portfolio/aarambh-heights/plan.webp', 2, 'GALLERY', 'Aarambh Heights illustrative floor plan', 1600, 900, 'image/webp', 'APPROVED'),
  ('40000000-0000-4000-8000-000000000002', 'fixtures/portfolio/mp-nagar-offices/cover.webp', 1, 'COVER', 'Commercial office interior in MP Nagar', 1600, 900, 'image/webp', 'APPROVED');

INSERT INTO portfolio_project_details (
  portfolio_item_id, developer_entity_id, developer_display_name, project_status_id, launch_date, possession_date,
  minimum_price_paise, maximum_price_paise, configuration_summary, public_address, latitude, longitude,
  location_precision, brochure_object_key, facts_confirmed_at
) VALUES (
  '40000000-0000-4000-8000-000000000001', '20000000-0000-4000-8000-000000000001', 'Aarambh Realty',
  (SELECT id FROM project_statuses WHERE code='UNDER_CONSTRUCTION'), '2026-04-01', '2028-12-01',
  620000000, 920000000, '2 & 3 BHK homes', 'Hoshangabad Road, Bhopal', 23.181500, 77.434800,
  'APPROXIMATE', 'fixtures/portfolio/aarambh-heights/brochure.pdf', '2026-11-08 10:00:00+05:30'
);

INSERT INTO portfolio_project_configurations (portfolio_item_id, public_label, minimum_area_sqm, maximum_area_sqm, preferred_area_unit, minimum_price_paise, maximum_price_paise, display_order) VALUES
  ('40000000-0000-4000-8000-000000000001', '2 BHK', 97.548192, 111.483648, 'SQ_FT', 620000000, 720000000, 1),
  ('40000000-0000-4000-8000-000000000001', '3 BHK', 130.064256, 148.644864, 'SQ_FT', 780000000, 920000000, 2);

INSERT INTO portfolio_project_registrations (portfolio_item_id, authority_code, registration_number, phase_label, public_source_url, facts_confirmed_at) VALUES
  ('40000000-0000-4000-8000-000000000001', 'MPRERA', 'P-BPL-FIXTURE-2026', 'Phase 1', 'https://rera.example.invalid/project/P-BPL-FIXTURE-2026', '2026-11-08 10:00:00+05:30');

INSERT INTO portfolio_project_amenities (portfolio_item_id, amenity_id)
SELECT '40000000-0000-4000-8000-000000000001', id FROM amenities WHERE code IN ('SECURITY', 'PARKING', 'POWER_BACKUP', 'GARDEN', 'LIFT');

INSERT INTO portfolio_item_land_uses (portfolio_item_id, land_use_type_id)
SELECT '40000000-0000-4000-8000-000000000004', id FROM land_use_types WHERE code IN ('RESIDENTIAL', 'COMMERCIAL');

INSERT INTO portfolio_item_specialisations (portfolio_item_id, property_specialisation_id)
SELECT '40000000-0000-4000-8000-000000000001', id FROM property_specialisations WHERE code = 'NEW_PROJECT';
INSERT INTO portfolio_item_specialisations (portfolio_item_id, property_specialisation_id)
SELECT '40000000-0000-4000-8000-000000000005', id FROM property_specialisations WHERE code IN ('AUCTION_PROPERTY', 'BANK_AUCTION');

COMMIT;
