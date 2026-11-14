import {
  bigint,
  boolean,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const timestampTz = (name: string) => timestamp(name, { withTimezone: true, mode: "date" });

export const ownerAccounts = pgTable("owner_accounts", {
  id: uuid("id").primaryKey(),
  authUserId: uuid("auth_user_id").unique(),
  verifiedPhoneE164: text("verified_phone_e164").unique(),
  phoneVerifiedAt: timestampTz("phone_verified_at"),
  recoveryEmail: text("recovery_email"),
  accountStatus: text("account_status").$type<"ACTIVE" | "SUSPENDED" | "CLOSED">().notNull(),
  createdAt: timestampTz("created_at").notNull(),
  updatedAt: timestampTz("updated_at").notNull(),
});

export const entities = pgTable("entities", {
  id: uuid("id").primaryKey(),
  ownerAccountId: uuid("owner_account_id").references(() => ownerAccounts.id, {
    onDelete: "set null",
  }),
  publicName: text("public_name").notNull(),
  publicSlug: text("public_slug").notNull().unique(),
  sharedTotalRankingCreditPaise: bigint("shared_total_ranking_credit_paise", {
    mode: "bigint",
  }).notNull(),
  sharedTotalReachedAt: timestampTz("shared_total_reached_at"),
  shortDescription: text("short_description"),
  logoObjectKey: text("logo_object_key"),
  websiteUrl: text("website_url"),
  contactMethod: text("contact_method").$type<"CALL" | "WHATSAPP">().notNull(),
  contactPhoneE164: text("contact_phone_e164").notNull(),
  contactPhoneVerifiedAt: timestampTz("contact_phone_verified_at"),
  publicationStatus: text("publication_status")
    .$type<"DRAFT" | "PUBLISHED" | "UNPUBLISHED" | "ARCHIVED">()
    .notNull(),
  moderationStatus: text("moderation_status")
    .$type<"PENDING" | "APPROVED" | "RESTRICTED" | "REJECTED">()
    .notNull(),
  legacySourceKey: text("legacy_source_key").unique(),
  createdAt: timestampTz("created_at").notNull(),
  updatedAt: timestampTz("updated_at").notNull(),
});

export const entitySocialLinks = pgTable(
  "entity_social_links",
  {
    id: uuid("id").primaryKey(),
    entityId: uuid("entity_id")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    platform: text("platform")
      .$type<"INSTAGRAM" | "FACEBOOK" | "YOUTUBE" | "LINKEDIN" | "X" | "WEBSITE" | "OTHER">()
      .notNull(),
    publicLabel: text("public_label").notNull(),
    url: text("url").notNull(),
    displayOrder: smallint("display_order").notNull(),
    createdAt: timestampTz("created_at").notNull(),
    updatedAt: timestampTz("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("entity_social_links_entity_order_unique").on(table.entityId, table.displayOrder),
    uniqueIndex("entity_social_links_entity_platform_url_unique").on(
      table.entityId,
      table.platform,
      table.url,
    ),
  ],
);

export const cities = pgTable(
  "cities",
  {
    id: uuid("id").primaryKey(),
    canonicalName: text("canonical_name").notNull(),
    stateName: text("state_name").notNull(),
    stateCode: text("state_code").notNull(),
    districtName: text("district_name"),
    districtCode: text("district_code"),
    slug: text("slug").notNull().unique(),
    catalogStatus: text("catalog_status")
      .$type<"AVAILABLE" | "REVIEW" | "BLOCKED" | "RETIRED">()
      .notNull(),
    realrankStatus: text("realrank_status")
      .$type<"UNOPENED" | "LIVE" | "EMPTY" | "SUSPENDED">()
      .notNull(),
    sourceActive: boolean("source_active").notNull(),
    sourceUpdatedAt: timestampTz("source_updated_at"),
    lastReviewedAt: timestampTz("last_reviewed_at"),
    firstLiveAt: timestampTz("first_live_at"),
    createdAt: timestampTz("created_at").notNull(),
    updatedAt: timestampTz("updated_at").notNull(),
  },
  (table) => [
    uniqueIndex("cities_canonical_state_district_unique").on(
      table.canonicalName,
      table.stateCode,
      table.districtCode,
    ),
  ],
);

export const cityAliases = pgTable(
  "city_aliases",
  {
    id: uuid("id").primaryKey(),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "cascade" }),
    alias: text("alias").notNull(),
    normalizedAlias: text("normalized_alias").notNull(),
    aliasType: text("alias_type")
      .$type<"COMMON" | "FORMER_NAME" | "SPELLING" | "TRANSLITERATION">()
      .notNull(),
    locale: text("locale"),
    isActive: boolean("is_active").notNull(),
    createdAt: timestampTz("created_at").notNull(),
  },
  (table) => [
    uniqueIndex("city_aliases_city_normalized_unique").on(table.cityId, table.normalizedAlias),
  ],
);

export const cityExternalRefs = pgTable(
  "city_external_refs",
  {
    id: uuid("id").primaryKey(),
    cityId: uuid("city_id")
      .notNull()
      .references(() => cities.id, { onDelete: "cascade" }),
    source: text("source").$type<"LGD" | "CENSUS" | "MANUAL">().notNull(),
    externalCode: text("external_code").notNull(),
    sourceDisplayName: text("source_display_name"),
    sourceRecordUpdatedAt: timestampTz("source_record_updated_at"),
    lastSynchronizedAt: timestampTz("last_synchronized_at"),
    sourceMetadata: jsonb("source_metadata"),
  },
  (table) => [
    uniqueIndex("city_external_refs_source_code_unique").on(table.source, table.externalCode),
  ],
);

export const categories = pgTable("categories", {
  id: uuid("id").primaryKey(),
  code: text("code").$type<"RESIDENTIAL" | "COMMERCIAL" | "LAND_PLOT">().notNull().unique(),
  publicName: text("public_name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  iconKey: text("icon_key").notNull(),
  displayOrder: smallint("display_order").notNull().unique(),
  isActive: boolean("is_active").notNull(),
});

export const discoveryFilters = pgTable(
  "discovery_filters",
  {
    id: uuid("id").primaryKey(),
    code: text("code").notNull().unique(),
    publicName: text("public_name").notNull().unique(),
    slug: text("slug").notNull().unique(),
    iconKey: text("icon_key").notNull(),
    sourceDimension: text("source_dimension")
      .$type<"PRIMARY_CATEGORY" | "PURPOSE" | "PROPERTY_TYPE" | "SPECIALISATION">()
      .notNull(),
    sourceCode: text("source_code").notNull(),
    displayGroup: text("display_group").$type<"PRIMARY" | "MORE">().notNull(),
    displayOrder: smallint("display_order").notNull(),
    isActive: boolean("is_active").notNull(),
  },
  (table) => [
    uniqueIndex("discovery_filters_group_order_unique").on(table.displayGroup, table.displayOrder),
  ],
);

export const propertyTypes = pgTable(
  "property_types",
  {
    id: uuid("id").primaryKey(),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "restrict" }),
    code: text("code").notNull().unique(),
    publicName: text("public_name").notNull(),
    displayOrder: smallint("display_order").notNull(),
    supportsConfiguration: boolean("supports_configuration").notNull(),
    isActive: boolean("is_active").notNull(),
  },
  (table) => [
    uniqueIndex("property_types_category_order_unique").on(table.categoryId, table.displayOrder),
  ],
);

export const propertySpecialisations = pgTable("property_specialisations", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull().unique(),
  publicName: text("public_name").notNull().unique(),
  isActive: boolean("is_active").notNull(),
});

export const landUseTypes = pgTable("land_use_types", {
  id: uuid("id").primaryKey(),
  code: text("code").$type<"RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL">().notNull().unique(),
  publicName: text("public_name").notNull().unique(),
  displayOrder: smallint("display_order").notNull().unique(),
  isActive: boolean("is_active").notNull(),
});

export const portfolioItemKinds = pgTable("portfolio_item_kinds", {
  id: uuid("id").primaryKey(),
  code: text("code").$type<"PROJECT" | "PROPERTY" | "COLLECTION" | "AUCTION">().notNull().unique(),
  publicName: text("public_name").notNull().unique(),
  displayOrder: smallint("display_order").notNull().unique(),
  isActive: boolean("is_active").notNull(),
});

export const projectStatuses = pgTable("project_statuses", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull().unique(),
  publicName: text("public_name").notNull().unique(),
  displayOrder: smallint("display_order").notNull().unique(),
  isActive: boolean("is_active").notNull(),
});

export const amenities = pgTable("amenities", {
  id: uuid("id").primaryKey(),
  code: text("code").notNull().unique(),
  publicName: text("public_name").notNull().unique(),
  displayOrder: smallint("display_order").notNull().unique(),
  isActive: boolean("is_active").notNull(),
});
