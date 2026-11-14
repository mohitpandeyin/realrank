import {
  bigint,
  boolean,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  amenities,
  categories,
  cities,
  entities,
  landUseTypes,
  portfolioItemKinds,
  projectStatuses,
  propertySpecialisations,
  propertyTypes,
} from "./identity";

const timestampTz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const portfolioItems = pgTable(
  "portfolio_items",
  {
    id: uuid("id").primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    itemKindId: uuid("item_kind_id").references(() => portfolioItemKinds.id, {
      onDelete: "restrict",
    }),
    title: text("title").notNull(),
    publicSlug: text("public_slug").notNull(),
    featuredOrder: smallint("featured_order"),
    primaryCategoryId: uuid("primary_category_id").references(() => categories.id, {
      onDelete: "restrict",
    }),
    propertyTypeId: uuid("property_type_id").references(() => propertyTypes.id, {
      onDelete: "restrict",
    }),
    listingPurpose: text("listing_purpose").$type<"SALE" | "RENT" | "LEASE">(),
    classificationSource: text("classification_source").$type<
      "USER_SELECTED" | "CONTROLLED_TAG" | "LEGACY_MAPPED" | "INFERRED"
    >(),
    classificationStatus: text("classification_status")
      .$type<"UNCLASSIFIED" | "NEEDS_CONFIRMATION" | "CONFIRMED">()
      .notNull(),
    classificationConfirmedAt: timestampTz("classification_confirmed_at"),
    residentialConfigurationKind: text("residential_configuration_kind").$type<"RK" | "BHK">(),
    residentialRoomCount: smallint("residential_room_count"),
    residentialRoomCountPlus: boolean("residential_room_count_plus").notNull(),
    furnishingStatus: text("furnishing_status").$type<
      "UNFURNISHED" | "SEMI_FURNISHED" | "FURNISHED"
    >(),
    originalAreaValue: numeric("original_area_value", { precision: 18, scale: 4 }),
    originalAreaUnit: text("original_area_unit").$type<
      "SQ_FT" | "SQ_M" | "SQ_YD" | "ACRE" | "HECTARE"
    >(),
    canonicalAreaSqm: numeric("canonical_area_sqm", { precision: 18, scale: 6 }),
    areaType: text("area_type").$type<"CARPET" | "BUILT_UP" | "SUPER_BUILT_UP" | "PLOT">(),
    priceAmountPaise: bigint("price_amount_paise", { mode: "bigint" }),
    priceContext: text("price_context").$type<"TOTAL" | "MONTH" | "LEASE">(),
    locality: text("locality"),
    description: text("description"),
    externalUrl: text("external_url"),
    publicationStatus: text("publication_status")
      .$type<"DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "WITHDRAWN" | "ARCHIVED">()
      .notNull(),
    moderationStatus: text("moderation_status")
      .$type<"PENDING" | "APPROVED" | "RESTRICTED" | "REJECTED">()
      .notNull(),
    legacyCategoryValues: jsonb("legacy_category_values").$type<Record<string, unknown>>(),
    legacySourceKey: text("legacy_source_key"),
    auctioningAuthority: text("auctioning_authority"),
    auctionSourceUrl: text("auction_source_url"),
    auctionAt: timestampTz("auction_at"),
    auctionReservePriceLabel: text("auction_reserve_price_label"),
    auctionFactsConfirmedAt: timestampTz("auction_facts_confirmed_at"),
    publishedAt: timestampTz("published_at"),
    lastUpdatedAt: timestampTz("last_updated_at").notNull(),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("portfolio_items_entity_slug_unique").on(table.entityId, table.publicSlug),
    index("portfolio_items_entity_publication_idx").on(
      table.entityId,
      table.publicationStatus,
      table.lastUpdatedAt,
    ),
    index("portfolio_items_category_type_idx").on(table.primaryCategoryId, table.propertyTypeId),
  ],
);

export const portfolioItemCities = pgTable(
  "portfolio_item_cities",
  {
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "restrict" }),
    isPrimary: boolean("is_primary").notNull(),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.portfolioItemId, table.cityId] }),
    index("portfolio_item_cities_city_idx").on(table.cityId, table.portfolioItemId),
  ],
);

export const portfolioItemMedia = pgTable(
  "portfolio_item_media",
  {
    id: uuid("id").primaryKey(),
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    storageObjectKey: text("storage_object_key").notNull().unique(),
    displayOrder: smallint("display_order").notNull(),
    mediaRole: text("media_role").$type<"COVER" | "GALLERY">().notNull(),
    altText: text("alt_text"),
    widthPx: integer("width_px").notNull(),
    heightPx: integer("height_px").notNull(),
    mimeType: text("mime_type").$type<"image/jpeg" | "image/png" | "image/webp">().notNull(),
    moderationStatus: text("moderation_status")
      .$type<"PENDING" | "APPROVED" | "RESTRICTED" | "REJECTED">()
      .notNull(),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("portfolio_item_media_item_order_unique").on(
      table.portfolioItemId,
      table.displayOrder,
    ),
  ],
);

export const portfolioProjectDetails = pgTable("portfolio_project_details", {
  portfolioItemId: uuid("portfolio_item_id")
    .primaryKey()
    .references(() => portfolioItems.id, { onDelete: "cascade" }),
  developerEntityId: uuid("developer_entity_id").references(() => entities.id, {
    onDelete: "set null",
  }),
  developerDisplayName: text("developer_display_name"),
  projectStatusId: uuid("project_status_id").references(() => projectStatuses.id, {
    onDelete: "restrict",
  }),
  launchDate: date("launch_date", { mode: "date" }),
  possessionDate: date("possession_date", { mode: "date" }),
  minimumPricePaise: bigint("minimum_price_paise", { mode: "bigint" }),
  maximumPricePaise: bigint("maximum_price_paise", { mode: "bigint" }),
  configurationSummary: text("configuration_summary"),
  publicAddress: text("public_address"),
  latitude: numeric("latitude", { precision: 9, scale: 6 }),
  longitude: numeric("longitude", { precision: 9, scale: 6 }),
  locationPrecision: text("location_precision").$type<"EXACT" | "APPROXIMATE">(),
  brochureObjectKey: text("brochure_object_key"),
  brochureExternalUrl: text("brochure_external_url"),
  factsConfirmedAt: timestampTz("facts_confirmed_at"),
  updatedAt: timestampTz("updated_at").notNull(),
});

export const portfolioProjectConfigurations = pgTable(
  "portfolio_project_configurations",
  {
    id: uuid("id").primaryKey(),
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    publicLabel: text("public_label").notNull(),
    minimumAreaSqm: numeric("minimum_area_sqm", { precision: 18, scale: 6 }),
    maximumAreaSqm: numeric("maximum_area_sqm", { precision: 18, scale: 6 }),
    preferredAreaUnit: text("preferred_area_unit").$type<"SQ_FT" | "SQ_M" | "SQ_YD">(),
    minimumPricePaise: bigint("minimum_price_paise", { mode: "bigint" }),
    maximumPricePaise: bigint("maximum_price_paise", { mode: "bigint" }),
    displayOrder: smallint("display_order").notNull(),
  },
  (table) => [
    uniqueIndex("portfolio_project_configurations_item_order_unique").on(
      table.portfolioItemId,
      table.displayOrder,
    ),
    index("portfolio_project_configurations_item_idx").on(
      table.portfolioItemId,
      table.displayOrder,
    ),
  ],
);

export const portfolioProjectRegistrations = pgTable(
  "portfolio_project_registrations",
  {
    id: uuid("id").primaryKey(),
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    authorityCode: text("authority_code").notNull(),
    registrationNumber: text("registration_number").notNull(),
    phaseLabel: text("phase_label"),
    publicSourceUrl: text("public_source_url"),
    factsConfirmedAt: timestampTz("facts_confirmed_at"),
  },
  (table) => [
    uniqueIndex("portfolio_project_registrations_item_authority_number_unique").on(
      table.portfolioItemId,
      table.authorityCode,
      table.registrationNumber,
    ),
  ],
);

export const portfolioProjectAmenities = pgTable(
  "portfolio_project_amenities",
  {
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    amenityId: uuid("amenity_id")
      .notNull()
      .references(() => amenities.id, { onDelete: "restrict" }),
  },
  (table) => [primaryKey({ columns: [table.portfolioItemId, table.amenityId] })],
);

export const portfolioItemSpecialisations = pgTable(
  "portfolio_item_specialisations",
  {
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    propertySpecialisationId: uuid("property_specialisation_id")
      .notNull()
      .references(() => propertySpecialisations.id, { onDelete: "restrict" }),
  },
  (table) => [primaryKey({ columns: [table.portfolioItemId, table.propertySpecialisationId] })],
);

export const portfolioItemLandUses = pgTable(
  "portfolio_item_land_uses",
  {
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    landUseTypeId: uuid("land_use_type_id")
      .notNull()
      .references(() => landUseTypes.id, { onDelete: "restrict" }),
  },
  (table) => [primaryKey({ columns: [table.portfolioItemId, table.landUseTypeId] })],
);

export const controlledTags = pgTable("controlled_tags", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull().unique(),
  publicName: text("public_name").notNull(),
  dimension: text("dimension")
    .$type<
      "PURPOSE" | "PROPERTY_TYPE" | "CONFIGURATION" | "FURNISHING" | "SPECIALISATION" | "OTHER"
    >()
    .notNull(),
  canonicalCode: text("canonical_code"),
  isActive: boolean("is_active").notNull(),
});

export const portfolioItemTags = pgTable(
  "portfolio_item_tags",
  {
    portfolioItemId: uuid("portfolio_item_id")
      .notNull()
      .references(() => portfolioItems.id, { onDelete: "cascade" }),
    controlledTagId: uuid("controlled_tag_id")
      .notNull()
      .references(() => controlledTags.id, { onDelete: "restrict" }),
    source: text("source")
      .$type<"USER_SELECTED" | "CONTROLLED_TAG" | "LEGACY_MAPPED" | "INFERRED">()
      .notNull(),
    confirmedAt: timestampTz("confirmed_at"),
  },
  (table) => [primaryKey({ columns: [table.portfolioItemId, table.controlledTagId] })],
);
