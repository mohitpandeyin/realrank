import {
  BedDouble,
  Building,
  Building2,
  Factory,
  Gavel,
  Gem,
  Grid2X2,
  House,
  KeyRound,
  Map,
  MessageCircle,
  MoreHorizontal,
  Phone,
  Sprout,
  Users,
  Warehouse,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { ListingEntryForm } from "@/features/listing-entry/ListingEntryForm.client";
import type {
  DiscoveryEntity,
  DiscoveryFilter,
  PublicDiscovery,
} from "@/server/db/queries/public-discovery";

import styles from "./DiscoveryHome.module.css";
import { StickyListingAction } from "./StickyListingAction";

const filterIcons: Record<string, LucideIcon> = {
  RESIDENTIAL: House,
  COMMERCIAL: Building2,
  LAND_PLOT: Map,
  RENTALS: KeyRound,
  NEW_PROJECTS: Building,
  LUXURY: Gem,
  INDUSTRIAL: Factory,
  WAREHOUSES: Warehouse,
  CO_WORKING: Users,
  AGRICULTURAL: Sprout,
  PG_HOSTELS: BedDouble,
  FARMHOUSES: House,
  AUCTION_PROPERTIES: Gavel,
};

function formatRupees(paise: bigint): string {
  return `₹${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(
    Number(paise / 100n),
  )}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function filterHref(filter: DiscoveryFilter | null): string {
  return filter
    ? `/?category=${encodeURIComponent(filter.slug)}#realrank-index`
    : "/#realrank-index";
}

function FilterLink({
  filter,
  active,
  compact = false,
}: {
  filter: DiscoveryFilter;
  active: boolean;
  compact?: boolean;
}) {
  const Icon = filterIcons[filter.code] ?? Grid2X2;
  return (
    <Link
      className={`${styles.rrFilter} ${compact ? styles.rrFilterCompact : ""}`}
      href={filterHref(filter)}
      aria-label={filter.name}
      aria-current={active ? "page" : undefined}
    >
      <Icon aria-hidden="true" size={17} />
      <span>{filter.name}</span>
    </Link>
  );
}

function EntityCard({ entity, citySlug }: { entity: DiscoveryEntity; citySlug: string }) {
  const isWhatsapp = entity.contactMethod === "WHATSAPP";
  const ContactIcon = isWhatsapp ? MessageCircle : Phone;
  const normalizedPhone = entity.contactPhoneE164.replace(/\D/g, "");
  const contactHref = isWhatsapp
    ? `https://wa.me/${normalizedPhone}`
    : `tel:${entity.contactPhoneE164}`;
  const claimAmountRupees = entity.rankTotalPaise / 100n + 1n;

  return (
    <article
      className={`${styles.rrEntityCard} ${entity.position <= 3 ? styles.rrEntityCardLeader : ""} ${
        entity.position === 1 ? styles.rrEntityCardFirst : ""
      }`}
    >
      <span className={styles.rrPosition} aria-label={`Position ${entity.position}`}>
        #{entity.position}
      </span>
      <span className={styles.rrEntityLogo} aria-hidden="true">
        {initials(entity.name)}
      </span>
      <div className={styles.rrEntityMain}>
        <div className={styles.rrEntityTitleRow}>
          <span className={styles.rrMobileLogo} aria-hidden="true">
            {initials(entity.name)}
          </span>
          <Link href={`/entity/${entity.slug}`}>{entity.name}</Link>
        </div>
        {entity.description ? (
          <p className={styles.rrEntityDescription}>{entity.description}</p>
        ) : null}
        {entity.categories.length > 0 ? (
          <p className={styles.rrEntityCategories}>{entity.categories.join(" · ")}</p>
        ) : null}
        <a
          className={styles.rrContact}
          href={contactHref}
          target={isWhatsapp ? "_blank" : undefined}
          rel={isWhatsapp ? "noreferrer" : undefined}
          aria-label={`Contact ${entity.name} by ${isWhatsapp ? "WhatsApp" : "phone"}`}
        >
          <ContactIcon aria-hidden="true" size={16} />
          Contact
        </a>
      </div>
      <div className={styles.rrEntitySide}>
        <span className={styles.rrRankTotal}>
          <strong>{formatRupees(entity.rankTotalPaise)}</strong>
          <span>rank total</span>
        </span>
        <Link
          className={styles.rrClaim}
          href={`/?amount=${claimAmountRupees.toString()}#rr-entry-form`}
          aria-label={`Set Rank Amount to claim position ${entity.position} in ${citySlug}`}
        >
          Claim #{entity.position}
        </Link>
      </div>
    </article>
  );
}

export function DiscoveryHome({
  discovery,
  initialAmountRupees,
}: {
  discovery: PublicDiscovery;
  initialAmountRupees: string;
}) {
  const primaryFilters = discovery.filters.filter((filter) => filter.group === "PRIMARY");
  const moreFilters = discovery.filters.filter((filter) => filter.group === "MORE");
  const firstPlaceAmountRupees = discovery.entities[0]
    ? (discovery.entities[0].rankTotalPaise / 100n + 1n).toString()
    : "10";

  return (
    <>
      <section className={styles.rrHero} id="rr-discovery-hero">
        <div className={styles.rrLiveStatus}>
          <span aria-hidden="true" />
          Now live in {discovery.city.name} · Rankings update after confirmed payments
        </div>
        <h1>
          The Real Estate <em>Discovery Index</em>
          <br /> of Companies &amp; Marketers.
        </h1>
        <p>
          Where real estate companies and marketers claim prime digital visibility across leading
          property categories. Bid transparently, showcase live portfolios, and connect directly
          with high-intent property buyers—zero commission fees, zero middleman algorithms.
        </p>
        <ListingEntryForm
          citySlug={discovery.city.slug}
          initialAmountRupees={initialAmountRupees}
          firstPlaceAmountRupees={firstPlaceAmountRupees}
        />
      </section>

      <StickyListingAction />

      <section className={styles.rrIndex} id="realrank-index">
        <div className={styles.rrIndexInner}>
          <div className={styles.rrIndexHeader}>
            <div>
              <h2>Realrank Index</h2>
              <p>Discover companies and marketers, explore portfolios, and connect directly.</p>
            </div>
            <p className={styles.rrRankingDisclosure}>
              Paid ranking · not a quality score or recommendation
            </p>
          </div>

          <div className={styles.rrFilterRail} aria-label="Filter the Realrank Index by category">
            <Link
              className={styles.rrFilter}
              href={filterHref(null)}
              aria-current={discovery.activeFilterSlug === null ? "page" : undefined}
            >
              <Grid2X2 aria-hidden="true" size={17} />
              <span>All</span>
            </Link>
            {primaryFilters.map((filter) => (
              <FilterLink
                key={filter.code}
                filter={filter}
                active={discovery.activeFilterSlug === filter.slug}
              />
            ))}
            <details className={styles.rrMoreFilters}>
              <summary>
                <MoreHorizontal aria-hidden="true" size={18} />
                <span>More</span>
              </summary>
              <div className={styles.rrMoreIsland}>
                <strong>Purpose &amp; specialities</strong>
                <div>
                  {moreFilters.map((filter) => (
                    <FilterLink
                      key={filter.code}
                      filter={filter}
                      compact
                      active={discovery.activeFilterSlug === filter.slug}
                    />
                  ))}
                </div>
              </div>
            </details>
          </div>

          <div className={styles.rrRankings} aria-label="Entity rankings">
            {discovery.entities.length === 0 ? (
              <div className={styles.rrEmptyState}>
                <strong>No matching entities yet</strong>
                <span>Try another category or be the first to list here.</span>
              </div>
            ) : (
              discovery.entities.map((entity, index) => (
                <div className={styles.rrRankingEntry} key={entity.id}>
                  {index === 0 ? (
                    <div className={styles.rrRankGroup}>
                      <strong>Top 3</strong>
                      <span>Highest paid positions</span>
                    </div>
                  ) : null}
                  {index === 3 ? (
                    <div className={styles.rrRankGroup}>
                      <strong>More</strong>
                      <span>Positions 4 onward</span>
                    </div>
                  ) : null}
                  <EntityCard entity={entity} citySlug={discovery.city.slug} />
                </div>
              ))
            )}
          </div>

          <p className={styles.rrIndexNote}>
            Positions are paid and ordered by Rank total—not by quality, reviews, recommendation or
            business verification. <Link href="/ranking-policy">How ranking works</Link>
          </p>
        </div>
      </section>
    </>
  );
}
