BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE owner_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid UNIQUE,
  verified_phone_e164 text UNIQUE,
  phone_verified_at timestamptz,
  recovery_email text,
  account_status text NOT NULL DEFAULT 'ACTIVE'
    CHECK (account_status IN ('ACTIVE', 'SUSPENDED', 'CLOSED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK ((verified_phone_e164 IS NULL) = (phone_verified_at IS NULL)),
  CHECK (verified_phone_e164 IS NULL OR verified_phone_e164 ~ '^\+[1-9][0-9]{7,14}$')
);

CREATE TABLE entities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_account_id uuid REFERENCES owner_accounts(id) ON DELETE SET NULL,
  public_name text NOT NULL CHECK (char_length(btrim(public_name)) BETWEEN 2 AND 160),
  public_slug text NOT NULL UNIQUE CHECK (public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  shared_total_ranking_credit_paise bigint NOT NULL DEFAULT 0 CHECK (shared_total_ranking_credit_paise >= 0),
  shared_total_reached_at timestamptz,
  short_description text CHECK (short_description IS NULL OR char_length(short_description) <= 240),
  logo_object_key text,
  website_url text,
  contact_method text NOT NULL DEFAULT 'WHATSAPP' CHECK (contact_method IN ('CALL', 'WHATSAPP')),
  contact_phone_e164 text NOT NULL CHECK (contact_phone_e164 ~ '^\+[1-9][0-9]{7,14}$'),
  contact_phone_verified_at timestamptz,
  publication_status text NOT NULL DEFAULT 'DRAFT'
    CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'ARCHIVED')),
  moderation_status text NOT NULL DEFAULT 'PENDING'
    CHECK (moderation_status IN ('PENDING', 'APPROVED', 'RESTRICTED', 'REJECTED')),
  legacy_source_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE entity_social_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  platform text NOT NULL CHECK (platform IN ('INSTAGRAM', 'FACEBOOK', 'YOUTUBE', 'LINKEDIN', 'X', 'WEBSITE', 'OTHER')),
  public_label text NOT NULL CHECK (char_length(btrim(public_label)) BETWEEN 1 AND 80),
  url text NOT NULL,
  display_order smallint NOT NULL DEFAULT 1 CHECK (display_order BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, display_order),
  UNIQUE (entity_id, platform, url)
);

CREATE TABLE cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  canonical_name text NOT NULL,
  state_name text NOT NULL,
  state_code text NOT NULL,
  district_name text,
  district_code text,
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  catalog_status text NOT NULL DEFAULT 'AVAILABLE'
    CHECK (catalog_status IN ('AVAILABLE', 'REVIEW', 'BLOCKED', 'RETIRED')),
  realrank_status text NOT NULL DEFAULT 'UNOPENED'
    CHECK (realrank_status IN ('UNOPENED', 'LIVE', 'EMPTY', 'SUSPENDED')),
  source_active boolean NOT NULL DEFAULT true,
  source_updated_at timestamptz,
  last_reviewed_at timestamptz,
  first_live_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (canonical_name, state_code, district_code)
);

CREATE TABLE city_aliases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  alias text NOT NULL,
  normalized_alias text NOT NULL,
  alias_type text NOT NULL CHECK (alias_type IN ('COMMON', 'FORMER_NAME', 'SPELLING', 'TRANSLITERATION')),
  locale text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (city_id, normalized_alias)
);

CREATE TABLE city_external_refs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  source text NOT NULL CHECK (source IN ('LGD', 'CENSUS', 'MANUAL')),
  external_code text NOT NULL,
  source_display_name text,
  source_record_updated_at timestamptz,
  last_synchronized_at timestamptz,
  source_metadata jsonb,
  UNIQUE (source, external_code)
);

CREATE TABLE categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code IN ('RESIDENTIAL', 'COMMERCIAL', 'LAND_PLOT')),
  public_name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon_key text NOT NULL,
  display_order smallint NOT NULL UNIQUE CHECK (display_order > 0),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE discovery_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  public_name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  icon_key text NOT NULL,
  source_dimension text NOT NULL CHECK (source_dimension IN ('PRIMARY_CATEGORY', 'PURPOSE', 'PROPERTY_TYPE', 'SPECIALISATION')),
  source_code text NOT NULL,
  display_group text NOT NULL CHECK (display_group IN ('PRIMARY', 'MORE')),
  display_order smallint NOT NULL CHECK (display_order > 0),
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (display_group, display_order)
);

CREATE TABLE property_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  code text NOT NULL UNIQUE,
  public_name text NOT NULL,
  display_order smallint NOT NULL CHECK (display_order > 0),
  supports_configuration boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  UNIQUE (category_id, display_order)
);

CREATE TABLE property_specialisations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  public_name text NOT NULL UNIQUE,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE land_use_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code IN ('RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL')),
  public_name text NOT NULL UNIQUE,
  display_order smallint NOT NULL UNIQUE CHECK (display_order > 0),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE portfolio_item_kinds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE CHECK (code IN ('PROJECT', 'PROPERTY', 'COLLECTION', 'AUCTION')),
  public_name text NOT NULL UNIQUE,
  display_order smallint NOT NULL UNIQUE CHECK (display_order > 0),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE project_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  public_name text NOT NULL UNIQUE,
  display_order smallint NOT NULL UNIQUE CHECK (display_order > 0),
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE amenities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  public_name text NOT NULL UNIQUE,
  display_order smallint NOT NULL UNIQUE CHECK (display_order > 0),
  is_active boolean NOT NULL DEFAULT true
);

INSERT INTO categories (code, public_name, slug, icon_key, display_order) VALUES
  ('RESIDENTIAL', 'Residential', 'residential', 'home', 1),
  ('COMMERCIAL', 'Commercial', 'commercial', 'building', 2),
  ('LAND_PLOT', 'Land & Plot', 'land-plot', 'map', 3);

INSERT INTO discovery_filters (code, public_name, slug, icon_key, source_dimension, source_code, display_group, display_order) VALUES
  ('RESIDENTIAL', 'Residential', 'residential', 'home', 'PRIMARY_CATEGORY', 'RESIDENTIAL', 'PRIMARY', 1),
  ('COMMERCIAL', 'Commercial', 'commercial', 'building', 'PRIMARY_CATEGORY', 'COMMERCIAL', 'PRIMARY', 2),
  ('LAND_PLOT', 'Land & Plot', 'land-plot', 'map', 'PRIMARY_CATEGORY', 'LAND_PLOT', 'PRIMARY', 3),
  ('RENTALS', 'Rentals', 'rentals', 'key', 'PURPOSE', 'RENT', 'MORE', 1),
  ('NEW_PROJECTS', 'New Projects', 'new-projects', 'building-2', 'SPECIALISATION', 'NEW_PROJECT', 'MORE', 2),
  ('LUXURY', 'Luxury', 'luxury', 'gem', 'SPECIALISATION', 'LUXURY', 'MORE', 3),
  ('INDUSTRIAL', 'Industrial', 'industrial', 'factory', 'SPECIALISATION', 'INDUSTRIAL', 'MORE', 4),
  ('WAREHOUSES', 'Warehouses', 'warehouses', 'warehouse', 'PROPERTY_TYPE', 'WAREHOUSE', 'MORE', 5),
  ('CO_WORKING', 'Co-working', 'co-working', 'users', 'SPECIALISATION', 'CO_WORKING', 'MORE', 6),
  ('AGRICULTURAL', 'Agricultural', 'agricultural', 'sprout', 'SPECIALISATION', 'AGRICULTURAL', 'MORE', 7),
  ('PG_HOSTELS', 'PG & Hostels', 'pg-hostels', 'bed', 'SPECIALISATION', 'PG_CO_LIVING', 'MORE', 8),
  ('FARMHOUSES', 'Farmhouses', 'farmhouses', 'trees', 'SPECIALISATION', 'FARMHOUSE', 'MORE', 9),
  ('AUCTION_PROPERTIES', 'Auction Properties', 'auction-properties', 'gavel', 'SPECIALISATION', 'AUCTION_PROPERTY', 'MORE', 10);

INSERT INTO property_types (category_id, code, public_name, display_order, supports_configuration)
SELECT categories.id, v.code, v.public_name, v.display_order, v.supports_configuration
FROM categories
CROSS JOIN LATERAL (VALUES
  ('APARTMENT', 'Flat / Apartment', 1, true), ('INDEPENDENT_HOUSE', 'Independent House', 2, true),
  ('VILLA', 'Villa', 3, true), ('BUILDER_FLOOR', 'Builder Floor', 4, true), ('ROW_HOUSE', 'Row House', 5, true),
  ('PENTHOUSE', 'Penthouse', 6, true), ('STUDIO_APARTMENT', 'Studio Apartment', 7, false),
  ('SERVICED_APARTMENT', 'Serviced Apartment', 8, true), ('FARMHOUSE', 'Farmhouse', 9, true),
  ('PG_CO_LIVING', 'PG / Co-living', 10, false), ('RESIDENTIAL_OTHER', 'Other Residential', 11, false)
) AS v(code, public_name, display_order, supports_configuration)
WHERE categories.code = 'RESIDENTIAL';

INSERT INTO property_types (category_id, code, public_name, display_order, supports_configuration)
SELECT categories.id, v.code, v.public_name, v.display_order, false
FROM categories
CROSS JOIN LATERAL (VALUES
  ('OFFICE', 'Office', 1), ('SHOP_RETAIL', 'Shop / Retail', 2), ('SHOWROOM', 'Showroom', 3),
  ('WAREHOUSE', 'Warehouse / Godown', 4), ('CO_WORKING', 'Co-working', 5),
  ('INDUSTRIAL_BUILDING', 'Industrial Building / Shed', 6), ('FACTORY', 'Factory / Manufacturing', 7),
  ('RESTAURANT_CAFE', 'Restaurant / Cafe', 8), ('HOTEL_RESORT', 'Hotel / Resort', 9),
  ('COMMERCIAL_OTHER', 'Other Commercial', 10)
) AS v(code, public_name, display_order)
WHERE categories.code = 'COMMERCIAL';

INSERT INTO property_types (category_id, code, public_name, display_order, supports_configuration)
SELECT categories.id, v.code, v.public_name, v.display_order, false
FROM categories
CROSS JOIN LATERAL (VALUES
  ('PLOT', 'Plot / Land parcel', 1), ('AGRICULTURAL_LAND', 'Agricultural Land', 2),
  ('FARM_LAND', 'Farm Land', 3), ('LAND_OTHER', 'Other Land', 4)
) AS v(code, public_name, display_order)
WHERE categories.code = 'LAND_PLOT';

INSERT INTO property_specialisations (code, public_name) VALUES
  ('NEW_PROJECT', 'New Project'), ('LUXURY', 'Luxury'), ('INDUSTRIAL', 'Industrial'),
  ('CO_WORKING', 'Co-working'), ('AGRICULTURAL', 'Agricultural'), ('PG_CO_LIVING', 'PG / Co-living'),
  ('FARMHOUSE', 'Farmhouse'), ('AUCTION_PROPERTY', 'Auction Property'), ('BANK_AUCTION', 'Bank Auction');

INSERT INTO land_use_types (code, public_name, display_order) VALUES
  ('RESIDENTIAL', 'Residential', 1), ('COMMERCIAL', 'Commercial', 2), ('INDUSTRIAL', 'Industrial', 3);

INSERT INTO portfolio_item_kinds (code, public_name, display_order) VALUES
  ('PROJECT', 'Project', 1), ('PROPERTY', 'Property', 2), ('COLLECTION', 'Collection', 3), ('AUCTION', 'Auction', 4);

INSERT INTO project_statuses (code, public_name, display_order) VALUES
  ('UPCOMING', 'Upcoming', 1), ('UNDER_CONSTRUCTION', 'Under construction', 2), ('READY_TO_MOVE', 'Ready to move', 3);

INSERT INTO amenities (code, public_name, display_order) VALUES
  ('SECURITY', '24-hour security', 1), ('PARKING', 'Parking', 2), ('POWER_BACKUP', 'Power backup', 3),
  ('CLUBHOUSE', 'Clubhouse', 4), ('GYM', 'Gym', 5), ('POOL', 'Swimming pool', 6),
  ('GARDEN', 'Garden', 7), ('LIFT', 'Lift', 8), ('PLAY_AREA', 'Children''s play area', 9);

COMMIT;
