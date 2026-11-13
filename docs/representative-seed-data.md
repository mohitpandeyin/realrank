# Realrank representative seed and state contract

Status: locked pre-build fixture specification, 10 November 2026.

This file defines deterministic development and test fixtures. These records must never be presented as genuine production supply, traffic, payments, verification or social proof. Use an unmistakable non-production environment marker and reserved test phone numbers/domains wherever the implementation permits.

## What the fixture set must prove

The smallest useful dataset must exercise:

- minimal and complete entity profiles;
- one-city and multi-city entities;
- different ranks produced by one shared Rank total;
- ties and deterministic tie-breaking;
- missing logos and portfolio media;
- long names, titles and amounts;
- Project, Property, Collection and Auction portfolio kinds;
- Residential, Commercial and Land & Plot dependencies;
- zero, sparse and meaningful analytics;
- loading, empty, unavailable, validation and recoverable-error states; and
- 320–375px mobile layouts without relying on shortened fixture copy.

## Canonical catalogue fixtures

| Record | Stable fixture key | State | Purpose |
|---|---|---|---|
| Indore, Madhya Pradesh | `city_indore_mp` | LIVE | Established city with enough entities for filters, ranking and pagination. |
| Bhopal, Madhya Pradesh | `city_bhopal_mp` | LIVE | Smaller live city opened by an existing entity. |
| Ujjain, Madhya Pradesh | `city_ujjain_mp` | UNOPENED | Recognised city that can be opened through the Add-city flow. |
| Jaipur, Rajasthan | `city_jaipur_rj` | EMPTY | Previously live city with no current published entities; public route is truthful and `noindex`. |

Seed the complete fixed discovery vocabulary and preserve its display order: Residential, Commercial, Land & Plot, Rentals, New Projects, Luxury, Industrial, Warehouses, Co-working, Agricultural, PG & Hostels, Farmhouses and Auction Properties. The homepage primary rail remains All, Residential, Commercial, Land & Plot regardless of fixture counts.

## Entity fixtures

| Entity | Fixture key | Cities and expected position | Shared Rank total | Profile condition |
|---|---|---|---:|---|
| Aarambh Realty | `entity_aarambh` | Bhopal #1, Indore #3 | ₹1,260 | Complete owner fixture: logo, verified owner phone, public WhatsApp, description, three categories and social link. |
| Apollo Realty | `entity_apollo` | Indore #1 | ₹1,850 | Complete public profile with no owner session in the default browser fixture. |
| Indore Spaces | `entity_indore_spaces` | Indore #2 | ₹1,450 | Sparse profile with no logo and only one portfolio item. |
| MP Property Hub | `entity_mp_hub` | Indore #4, Bhopal #2 | ₹840 | Multi-city fixture proving that the same total creates different positions. |
| Shree Siddhivinayak Warehousing and Industrial Property Advisors | `entity_long_name` | Indore #5 | ₹510 | Long-name, missing-media and narrow-screen stress fixture. |
| Equal Rank Estates | `entity_tie_early` | Indore #6 | ₹300 | Reached ₹300 before the next fixture and must remain above it. |
| Equal Rank Realty | `entity_tie_late` | Indore #7 | ₹300 | Same total, later eligibility timestamp. |
| Draft Entity | `entity_draft` | none | ₹0 | Owner-only unpublished fixture; never appears in public index queries. |

Money fixtures are stored as integer paise. Ranking contribution rows, payment rows and cached entity totals must reconcile. Do not generate totals by mutating the entity record alone.

## Portfolio fixtures

| Item | Fixture key | Kind | Required coverage |
|---|---|---|---|
| Aarambh Heights | `item_aarambh_heights` | PROJECT | Full gallery, 2/3 BHK configurations, under-construction status, approximate location, amenities, brochure, developer attribution, supplied RERA number and last-confirmed time. |
| MP Nagar office collection | `item_mp_nagar_offices` | COLLECTION | Commercial + Lease, optional price, one cover image, concise location. |
| Vijay Nagar residential selection with an intentionally long public title | `item_long_title` | PROPERTY | Residential + Sale, 4 BHK+, no media, long title and large price. |
| Rau mixed-use land parcel | `item_mixed_land` | PROPERTY | Land & Plot + Sale, Plot type, Residential and Commercial land-use values, original sq. yd. input and canonical square metres. |
| Bank auction opportunity | `item_bank_auction` | AUCTION | Commercial property, auction authority, source link, auction date, reserve-price label and last-confirmed time; never imply Realrank runs the auction. |
| Unclassified opportunity | `item_unclassified` | null | Only title, description, city and media; proves that optional classification does not block publishing. |
| Unavailable project | `item_unavailable` | PROJECT | Unpublished or withdrawn state used to validate the public unavailable treatment and owner recovery path. |
| Draft portfolio item | `item_draft` | PROPERTY | Owner-only draft excluded from public profile, sitemap and analytics denominators. |

Each published item has exactly one primary city drawn from the entity's active cities. The Project extension exists only for `PROJECT`; auction-only fields exist only where applicable. Media order, cover role and alt-text validation must be deterministic.

## Owner and access fixtures

- `owner_aarambh`: authenticated, phone verified, owns `entity_aarambh`.
- `owner_new`: phone verified, owns `entity_draft`, has no portfolio content or analytics.
- `owner_unverified_contact`: authenticated owner attempting to publish a changed public contact number; publication waits for verification.
- `owner_forbidden`: authenticated but does not own the requested entity; receives a non-revealing authorization state.

Use an explicit test OTP provider or fixed test-code mechanism outside production. Never put a real person's phone number in committed fixtures.

## Insights fixtures

Insights fixtures represent server-returned PostHog query results, not PostgreSQL source-of-truth records.

### Meaningful activity — `analytics_aarambh_28d`

- profile views: 1,248;
- listing views: 486;
- Contact clicks: 32;
- Contact rate: `32 / 486 = 6.6%`;
- item rows include Aarambh Heights, MP Nagar office collection and the long-title residential item;
- fixtures include 7-day, 28-day, 3-month and valid custom-range trend values.

### Sparse activity — `analytics_sparse_7d`

Return a few genuine views and no Contact click. Show totals and a restrained explanation, but suppress a trend whose sample is too small.

### No activity — `analytics_empty`

Return zero genuine activity and the dedicated empty state. Do not draw zero-filled charts or invent a percentage.

### Insights unavailable — `analytics_error`

Return a recoverable analytics-only error. Profile management, payment, publishing and Rank controls remain usable because analytics is non-critical.

## Reusable state matrix

| Surface | Loading treatment | Honest empty/unavailable treatment | Error treatment | Primary recovery |
|---|---|---|---|---|
| City index | Preserve heading and filters; skeleton only the result rows. | Keep the selected city/category and say no matching entities yet. | Inline result-area error; do not replace the whole page. | Retry or clear the active refinement. |
| Public profile | Render identity shell, then portfolio skeletons. | Omit optional social/details; portfolio says no items shared yet. | Keep any successfully loaded identity and isolate the failed region. | Retry the failed region or contact support. |
| Portfolio grid | Two-column media-shaped skeletons on mobile. | Owner: Add your first item. Public: No portfolio items shared yet, with no owner CTA. | Compact inline alert above unchanged content. | Retry. |
| Portfolio item | Reserve the media aspect ratio and title lines. | Withdrawn/unpublished: item unavailable, return to entity. | Keep entity attribution and provide retry. | Back to entity or retry. |
| Insights | Metric skeletons, then trend/list placeholders; retain date range. | Explain what will appear after genuine visits; no zero chart. | Insights-only notice; never block owner controls elsewhere. | Retry insights. |
| Owner profile save | Keep form values and disable only the submitting action. | Not applicable. | Field error for validation; form-level notice for service failure. | Correct the field or retry without losing input. |
| Media upload | Per-file progress and reserved thumbnail. | Missing media uses initials/property fallback. | Identify the failed file and preserve successful uploads. | Retry or choose another file. |
| Phone OTP | Preserve masked number and active channel. | Code not received is handled by resend and WhatsApp/SMS fallback. | Expired/incorrect code stays inline; rate-limit state shows retry time. | Resend or switch channel. |
| Payment confirmation | Purpose-built processing state; never use a generic spinner alone. | Not applicable. | Unknown/delayed is not failure and says not to pay again; definitive failure preserves listing data. | Check again, support, or retry only after definitive failure. |
| Rank top-up | Revalidate target on action; show local pending state. | A city at #1 has no claim prompt. | Keep current total and positions; never optimistically apply payment. | Recalculate or retry checkout. |
| City assignment | Search-result skeleton inside the selector. | Recognised unopened city may be selected; no results offers review, not arbitrary creation. | Preserve the current assignment. | Retry catalogue search or request review. |
| Authorization | Do not briefly render private owner content. | Not applicable. | Use a neutral access message without revealing private entity data. | Verify another number or get help. |

All status changes are announced through an `aria-live="polite"` region unless immediate interruption is necessary. Loading placeholders are `aria-hidden`; a separate accessible loading label identifies the region. Focus moves only when a dialog opens, a route changes or an error summary must be reviewed—never when background data refreshes.

## Bottom navigation lock

Authenticated owner screens use exactly five persistent destinations:

1. **Home** — returns to the public Realrank discovery homepage.
2. **Profile** — opens the signed-in entity profile, including portfolio management and cities.
3. **Position** — jumps to Realrank Index and Rank-total controls.
4. **Insights** — opens the focused performance screen for profile views, listing views and contact intent.
5. **Account** — opens ownership, phone access and sign-out utilities.

Five short, familiar labels remain legible in the phone navigation. Home clearly exits to public discovery, Profile groups entity identity, portfolio and city management, Position describes the owner's current Realrank standing more directly than the internal product term Index, and Insights gives performance monitoring a predictable home. Help remains in the sticky header, Add Item stays contextual to Portfolio, and notifications are deferred. Public pages have no owner bottom navigation.

## Fixture validation checklist

- Rankings recompute to the expected city positions from ledger-backed totals and tie timestamps.
- Public queries exclude draft, withdrawn and owner-preview records.
- A 320px viewport shows long entity/item names without horizontal overflow.
- Missing logo/media fallbacks do not look interactive.
- Empty analytics contains no fabricated counters or chart.
- Insights failure does not disable profile, portfolio, payment or ranking operations.
- All five bottom-navigation items remain at least 44px high with an accessible current state.
- Fixture identifiers and data are clearly excluded from production migrations and public analytics.
