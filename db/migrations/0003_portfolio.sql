BEGIN;

CREATE TABLE portfolio_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id uuid NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  item_kind_id uuid REFERENCES portfolio_item_kinds(id) ON DELETE RESTRICT,
  title text NOT NULL CHECK (char_length(btrim(title)) BETWEEN 2 AND 180),
  public_slug text NOT NULL CHECK (public_slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  featured_order smallint CHECK (featured_order BETWEEN 1 AND 3),
  primary_category_id uuid REFERENCES categories(id) ON DELETE RESTRICT,
  property_type_id uuid REFERENCES property_types(id) ON DELETE RESTRICT,
  listing_purpose text CHECK (listing_purpose IN ('SALE', 'RENT', 'LEASE')),
  classification_source text CHECK (classification_source IN ('USER_SELECTED', 'CONTROLLED_TAG', 'LEGACY_MAPPED', 'INFERRED')),
  classification_status text NOT NULL DEFAULT 'UNCLASSIFIED'
    CHECK (classification_status IN ('UNCLASSIFIED', 'NEEDS_CONFIRMATION', 'CONFIRMED')),
  classification_confirmed_at timestamptz,
  residential_configuration_kind text CHECK (residential_configuration_kind IN ('RK', 'BHK')),
  residential_room_count smallint CHECK (residential_room_count > 0),
  residential_room_count_plus boolean NOT NULL DEFAULT false,
  furnishing_status text CHECK (furnishing_status IN ('UNFURNISHED', 'SEMI_FURNISHED', 'FURNISHED')),
  original_area_value numeric(18,4) CHECK (original_area_value > 0),
  original_area_unit text CHECK (original_area_unit IN ('SQ_FT', 'SQ_M', 'SQ_YD', 'ACRE', 'HECTARE')),
  canonical_area_sqm numeric(18,6) CHECK (canonical_area_sqm > 0),
  area_type text CHECK (area_type IN ('CARPET', 'BUILT_UP', 'SUPER_BUILT_UP', 'PLOT')),
  price_amount_paise bigint CHECK (price_amount_paise > 0),
  price_context text CHECK (price_context IN ('TOTAL', 'MONTH', 'LEASE')),
  locality text,
  description text CHECK (description IS NULL OR char_length(description) <= 2000),
  external_url text,
  publication_status text NOT NULL DEFAULT 'DRAFT'
    CHECK (publication_status IN ('DRAFT', 'PUBLISHED', 'UNPUBLISHED', 'WITHDRAWN', 'ARCHIVED')),
  moderation_status text NOT NULL DEFAULT 'PENDING'
    CHECK (moderation_status IN ('PENDING', 'APPROVED', 'RESTRICTED', 'REJECTED')),
  legacy_category_values jsonb,
  legacy_source_key text,
  auctioning_authority text,
  auction_source_url text,
  auction_at timestamptz,
  auction_reserve_price_label text,
  auction_facts_confirmed_at timestamptz,
  published_at timestamptz,
  last_updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_id, public_slug),
  CHECK ((classification_status = 'CONFIRMED') = (classification_confirmed_at IS NOT NULL)),
  CHECK ((original_area_value IS NULL) = (original_area_unit IS NULL)),
  CHECK (canonical_area_sqm IS NULL OR original_area_value IS NOT NULL),
  CHECK ((price_amount_paise IS NULL) = (price_context IS NULL)),
  CHECK ((residential_configuration_kind IS NULL) = (residential_room_count IS NULL)),
  CHECK (publication_status <> 'PUBLISHED' OR published_at IS NOT NULL),
  CHECK (auction_source_url IS NULL OR auctioning_authority IS NOT NULL)
);

CREATE UNIQUE INDEX portfolio_items_featured_order_unique
  ON portfolio_items (entity_id, featured_order) WHERE featured_order IS NOT NULL AND publication_status = 'PUBLISHED';

CREATE UNIQUE INDEX portfolio_items_legacy_source_unique
  ON portfolio_items (entity_id, legacy_source_key) WHERE legacy_source_key IS NOT NULL;

CREATE TABLE portfolio_item_cities (
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  city_id uuid NOT NULL REFERENCES cities(id) ON DELETE RESTRICT,
  is_primary boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (portfolio_item_id, city_id)
);

CREATE UNIQUE INDEX portfolio_item_one_primary_city
  ON portfolio_item_cities (portfolio_item_id) WHERE is_primary;

CREATE TABLE portfolio_item_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  storage_object_key text NOT NULL UNIQUE,
  display_order smallint NOT NULL CHECK (display_order BETWEEN 1 AND 10),
  media_role text NOT NULL CHECK (media_role IN ('COVER', 'GALLERY')),
  alt_text text CHECK (alt_text IS NULL OR char_length(alt_text) <= 180),
  width_px integer NOT NULL CHECK (width_px > 0),
  height_px integer NOT NULL CHECK (height_px > 0),
  mime_type text NOT NULL CHECK (mime_type IN ('image/jpeg', 'image/png', 'image/webp')),
  moderation_status text NOT NULL DEFAULT 'PENDING'
    CHECK (moderation_status IN ('PENDING', 'APPROVED', 'RESTRICTED', 'REJECTED')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (portfolio_item_id, display_order)
);

CREATE UNIQUE INDEX portfolio_item_one_cover
  ON portfolio_item_media (portfolio_item_id) WHERE media_role = 'COVER';

CREATE TABLE portfolio_project_details (
  portfolio_item_id uuid PRIMARY KEY REFERENCES portfolio_items(id) ON DELETE CASCADE,
  developer_entity_id uuid REFERENCES entities(id) ON DELETE SET NULL,
  developer_display_name text,
  project_status_id uuid REFERENCES project_statuses(id) ON DELETE RESTRICT,
  launch_date date,
  possession_date date,
  minimum_price_paise bigint CHECK (minimum_price_paise > 0),
  maximum_price_paise bigint CHECK (maximum_price_paise > 0),
  configuration_summary text,
  public_address text,
  latitude numeric(9,6) CHECK (latitude BETWEEN -90 AND 90),
  longitude numeric(9,6) CHECK (longitude BETWEEN -180 AND 180),
  location_precision text CHECK (location_precision IN ('EXACT', 'APPROXIMATE')),
  brochure_object_key text,
  brochure_external_url text,
  facts_confirmed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (maximum_price_paise IS NULL OR minimum_price_paise IS NULL OR maximum_price_paise >= minimum_price_paise),
  CHECK ((latitude IS NULL) = (longitude IS NULL)),
  CHECK (latitude IS NULL OR location_precision IS NOT NULL),
  CHECK (brochure_object_key IS NULL OR brochure_external_url IS NULL)
);

CREATE TABLE portfolio_project_configurations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  public_label text NOT NULL,
  minimum_area_sqm numeric(18,6) CHECK (minimum_area_sqm > 0),
  maximum_area_sqm numeric(18,6) CHECK (maximum_area_sqm > 0),
  preferred_area_unit text CHECK (preferred_area_unit IN ('SQ_FT', 'SQ_M', 'SQ_YD')),
  minimum_price_paise bigint CHECK (minimum_price_paise > 0),
  maximum_price_paise bigint CHECK (maximum_price_paise > 0),
  display_order smallint NOT NULL CHECK (display_order > 0),
  UNIQUE (portfolio_item_id, display_order),
  CHECK (maximum_area_sqm IS NULL OR minimum_area_sqm IS NULL OR maximum_area_sqm >= minimum_area_sqm),
  CHECK (maximum_price_paise IS NULL OR minimum_price_paise IS NULL OR maximum_price_paise >= minimum_price_paise)
);

CREATE TABLE portfolio_project_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  authority_code text NOT NULL,
  registration_number text NOT NULL,
  phase_label text,
  public_source_url text,
  facts_confirmed_at timestamptz,
  UNIQUE (portfolio_item_id, authority_code, registration_number)
);

CREATE TABLE portfolio_project_amenities (
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  amenity_id uuid NOT NULL REFERENCES amenities(id) ON DELETE RESTRICT,
  PRIMARY KEY (portfolio_item_id, amenity_id)
);

CREATE TABLE portfolio_item_specialisations (
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  property_specialisation_id uuid NOT NULL REFERENCES property_specialisations(id) ON DELETE RESTRICT,
  PRIMARY KEY (portfolio_item_id, property_specialisation_id)
);

CREATE TABLE portfolio_item_land_uses (
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  land_use_type_id uuid NOT NULL REFERENCES land_use_types(id) ON DELETE RESTRICT,
  PRIMARY KEY (portfolio_item_id, land_use_type_id)
);

CREATE TABLE controlled_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  public_name text NOT NULL,
  dimension text NOT NULL CHECK (dimension IN ('PURPOSE', 'PROPERTY_TYPE', 'CONFIGURATION', 'FURNISHING', 'SPECIALISATION', 'OTHER')),
  canonical_code text,
  is_active boolean NOT NULL DEFAULT true
);

CREATE TABLE portfolio_item_tags (
  portfolio_item_id uuid NOT NULL REFERENCES portfolio_items(id) ON DELETE CASCADE,
  controlled_tag_id uuid NOT NULL REFERENCES controlled_tags(id) ON DELETE RESTRICT,
  source text NOT NULL CHECK (source IN ('USER_SELECTED', 'CONTROLLED_TAG', 'LEGACY_MAPPED', 'INFERRED')),
  confirmed_at timestamptz,
  PRIMARY KEY (portfolio_item_id, controlled_tag_id)
);

CREATE INDEX portfolio_items_entity_publication_idx ON portfolio_items (entity_id, publication_status, last_updated_at DESC);
CREATE INDEX portfolio_items_category_type_idx ON portfolio_items (primary_category_id, property_type_id) WHERE publication_status = 'PUBLISHED';
CREATE INDEX portfolio_item_cities_city_idx ON portfolio_item_cities (city_id, portfolio_item_id);
CREATE INDEX portfolio_project_configurations_item_idx ON portfolio_project_configurations (portfolio_item_id, display_order);

COMMIT;
