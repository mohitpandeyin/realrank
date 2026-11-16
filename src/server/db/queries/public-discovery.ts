import "server-only";

import { sql } from "drizzle-orm";

import { getDatabase } from "@/server/db/client";

export type DiscoveryFilter = Readonly<{
  code: string;
  name: string;
  slug: string;
  iconKey: string;
  group: "PRIMARY" | "MORE";
}>;

export type DiscoveryEntity = Readonly<{
  id: string;
  position: number;
  name: string;
  slug: string;
  description: string | null;
  logoObjectKey: string | null;
  rankTotalPaise: bigint;
  contactMethod: "CALL" | "WHATSAPP";
  contactPhoneE164: string;
  categories: readonly string[];
}>;

export type PublicDiscovery = Readonly<{
  city: Readonly<{ id: string; name: string; slug: string }>;
  filters: readonly DiscoveryFilter[];
  activeFilterSlug: string | null;
  entities: readonly DiscoveryEntity[];
}>;

type CityRow = { id: string; name: string; slug: string };
type FilterRow = {
  code: string;
  name: string;
  slug: string;
  icon_key: string;
  display_group: "PRIMARY" | "MORE";
};
type EntityRow = {
  id: string;
  position: string | number;
  name: string;
  slug: string;
  description: string | null;
  logo_object_key: string | null;
  rank_total_paise: string | bigint;
  contact_method: "CALL" | "WHATSAPP";
  contact_phone_e164: string;
  categories: string[] | null;
};

const defaultFilters: readonly DiscoveryFilter[] = [
  {
    code: "RESIDENTIAL",
    name: "Residential",
    slug: "residential",
    iconKey: "house",
    group: "PRIMARY",
  },
  {
    code: "COMMERCIAL",
    name: "Commercial",
    slug: "commercial",
    iconKey: "building-2",
    group: "PRIMARY",
  },
  { code: "LAND_PLOT", name: "Land & Plot", slug: "land-plot", iconKey: "map", group: "PRIMARY" },
  { code: "RENTALS", name: "Rentals", slug: "rentals", iconKey: "key-round", group: "MORE" },
  {
    code: "NEW_PROJECTS",
    name: "New Projects",
    slug: "new-projects",
    iconKey: "building",
    group: "MORE",
  },
  { code: "LUXURY", name: "Luxury", slug: "luxury", iconKey: "gem", group: "MORE" },
  { code: "INDUSTRIAL", name: "Industrial", slug: "industrial", iconKey: "factory", group: "MORE" },
  {
    code: "WAREHOUSES",
    name: "Warehouses",
    slug: "warehouses",
    iconKey: "warehouse",
    group: "MORE",
  },
  { code: "CO_WORKING", name: "Co-working", slug: "co-working", iconKey: "users", group: "MORE" },
  {
    code: "AGRICULTURAL",
    name: "Agricultural",
    slug: "agricultural",
    iconKey: "sprout",
    group: "MORE",
  },
  {
    code: "PG_HOSTELS",
    name: "PG & Hostels",
    slug: "pg-hostels",
    iconKey: "bed-double",
    group: "MORE",
  },
  { code: "FARMHOUSES", name: "Farmhouses", slug: "farmhouses", iconKey: "house", group: "MORE" },
  {
    code: "AUCTION_PROPERTIES",
    name: "Auction Properties",
    slug: "auction-properties",
    iconKey: "gavel",
    group: "MORE",
  },
];

function emptyDiscovery(filterSlug: string | null): PublicDiscovery {
  const activeFilterSlug = defaultFilters.some((filter) => filter.slug === filterSlug)
    ? filterSlug
    : null;

  return {
    city: { id: "", name: "Indore", slug: "indore" },
    filters: defaultFilters,
    activeFilterSlug,
    entities: [],
  };
}

export async function getPublicDiscovery(
  citySlug: string,
  requestedFilterSlug: string | null,
): Promise<PublicDiscovery> {
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production") {
    return emptyDiscovery(requestedFilterSlug);
  }

  const database = getDatabase();
  const [cityResult, filterResult] = await Promise.all([
    database.execute<CityRow>(sql`
      SELECT id::text, canonical_name AS name, slug
      FROM cities
      WHERE slug = ${citySlug}
        AND realrank_status = 'LIVE'
      LIMIT 1
    `),
    database.execute<FilterRow>(sql`
      SELECT code, public_name AS name, slug, icon_key, display_group
      FROM discovery_filters
      WHERE is_active
      ORDER BY
        CASE display_group WHEN 'PRIMARY' THEN 0 ELSE 1 END,
        display_order
    `),
  ]);

  const city = cityResult.rows[0];
  if (!city) {
    return emptyDiscovery(requestedFilterSlug);
  }

  const filters = filterResult.rows.map((filter) => ({
    code: filter.code,
    name: filter.name,
    slug: filter.slug,
    iconKey: filter.icon_key,
    group: filter.display_group,
  }));
  const activeFilterSlug = filters.some((filter) => filter.slug === requestedFilterSlug)
    ? requestedFilterSlug
    : null;

  const entityResult = await database.execute<EntityRow>(sql`
    WITH selected_rankings AS (
      SELECT
        city_id,
        city_listing_id,
        entity_id,
        public_name,
        public_slug,
        shared_total_ranking_credit_paise,
        position
      FROM public_city_rankings
      WHERE ${activeFilterSlug}::text IS NULL

      UNION ALL

      SELECT
        filter_rankings.city_id,
        filter_rankings.city_listing_id,
        filter_rankings.entity_id,
        filter_rankings.public_name,
        filter_rankings.public_slug,
        filter_rankings.shared_total_ranking_credit_paise,
        filter_rankings.position
      FROM public_city_filter_rankings filter_rankings
      JOIN discovery_filters active_filter
        ON active_filter.id = filter_rankings.discovery_filter_id
      WHERE ${activeFilterSlug}::text IS NOT NULL
        AND active_filter.slug = ${activeFilterSlug}
        AND active_filter.is_active
    )
    SELECT
      rankings.entity_id::text AS id,
      rankings.position,
      rankings.public_name AS name,
      rankings.public_slug AS slug,
      entities.short_description AS description,
      entities.logo_object_key,
      rankings.shared_total_ranking_credit_paise AS rank_total_paise,
      COALESCE(city_listings.contact_method_override, entities.contact_method)
        AS contact_method,
      COALESCE(city_listings.contact_phone_e164_override, entities.contact_phone_e164)
        AS contact_phone_e164,
      COALESCE(category_list.categories, ARRAY[]::text[]) AS categories
    FROM selected_rankings rankings
    JOIN entities ON entities.id = rankings.entity_id
    JOIN city_listings ON city_listings.id = rankings.city_listing_id
    LEFT JOIN LATERAL (
      SELECT array_agg(filters.public_name ORDER BY filters.display_order) AS categories
      FROM entity_discovery_filters selections
      JOIN discovery_filters filters ON filters.id = selections.discovery_filter_id
      WHERE selections.entity_id = rankings.entity_id
        AND filters.is_active
    ) category_list ON true
    WHERE rankings.city_id = ${city.id}::uuid
    ORDER BY rankings.position
  `);

  return {
    city,
    filters,
    activeFilterSlug,
    entities: entityResult.rows.map((entity) => ({
      id: entity.id,
      position: Number(entity.position),
      name: entity.name,
      slug: entity.slug,
      description: entity.description,
      logoObjectKey: entity.logo_object_key,
      rankTotalPaise: BigInt(entity.rank_total_paise),
      contactMethod: entity.contact_method,
      contactPhoneE164: entity.contact_phone_e164,
      categories: entity.categories ?? [],
    })),
  };
}
