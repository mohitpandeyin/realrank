# RealRank — Master Product Plan & Technical Direction

> **Status:** Current product source of truth
> **Last updated:** 13 September 2026
> **Launch market:** Indore first, designed for expansion across India
> **Public headline:** The Real Estate Discovery Index of Companies & Marketers.
> **Locked landing wireframe:** [`docs/wireframes/realrank-locked-terracotta.html`](docs/wireframes/realrank-locked-terracotta.html)
> **Draft flow wireframes for review:** [payment states](docs/wireframes/realrank-payment-states.html) · [payment success + email OTP](docs/wireframes/realrank-payment-success-otp.html) · [owner dashboard](docs/wireframes/realrank-owner-dashboard.html) · [public entity profile](docs/wireframes/realrank-entity-profile.html)

---

## 1. Product definition

RealRank is a public real-estate entity index and portfolio-profile platform.

Real-estate companies and marketers can pay for prominent sponsored positions. Public visitors can browse the index, open entity profiles and contact an entity directly by phone or WhatsApp. RealRank does not charge visitors, take a commission on property transactions or act as a lead-distribution middleman.

The core product has two connected functions:

1. **RealRank Index:** entities are presented in sponsored order according to their cumulative ranking amount.
2. **Portfolio Hub:** each entity may maintain an optional public profile and portfolio after its basic index listing is created.

The ranking is a visibility mechanism, not a quality score, recommendation, review score or business-verification system.

### Product principles

- **Simple entry:** an entity can start with only its name, contact number and ranking amount.
- **Payment before account setup:** the minimum listing can go live after successful payment; account completion happens afterward.
- **Public access:** visitors do not need an account to browse profiles or contact entities.
- **Transparent ordering:** ranking amounts and the price required to claim a position are visible.
- **Entity first:** the ranked object is always the company or marketer, not an individual project or property.
- **Optional depth:** categories, description and portfolio content improve the profile but do not block the minimum listing.
- **Location-scalable brand:** the headline and brand do not name Indore; city selection provides local context.
- **No commission:** RealRank earns from ranking payments made by professional entities, not from visitors or property transactions.

---

## 2. Audience and commercial model

### Public audience

Anyone may use RealRank to discover and contact real-estate entities. The public experience is free and requires no login.

### Paying audience

Revenue comes from:

- real-estate companies;
- property marketing companies;
- developers and project marketers;
- commercial-space operators;
- rental, co-working, warehousing and land-focused entities; and
- other professional real-estate entities accepted under the platform rules.

The public product should avoid using the word **broker** as the default audience label. Use **entity**, **company**, **marketer**, or a precise business type when known.

### Revenue mechanism

- Minimum initial ranking amount: **₹10**.
- Manually entered ranking amounts and top-ups may be any whole-rupee value of ₹10 or more.
- The `+` and `−` controls are convenience steppers: `+` moves to the next higher ₹10 multiple and `−` moves to the next lower ₹10 multiple, never below ₹10. They do not restrict typed values to ₹10 multiples.
- Every successfully captured ranking payment is platform revenue, subject to the published refund and dispute policy.
- Existing entities pay only the difference needed to reach their intended total.
- No subscription is required for the MVP.
- No property-sale or rental commission is charged.

Promotional coupons may fund an initial ranking credit. A coupon-funded amount must be recorded as **promotional ranking credit**, not falsely described as money paid by the entity. The public total may include valid promotional credit if the ranking rules disclose this.

---

## 3. Current MVP listing model

### Minimum hero form

The first screen contains exactly three inputs:

1. **Entity Name**
2. **Contact or WhatsApp Number**
3. **Rank Amount** — any whole-rupee value of ₹10 or more; the optional `+` and `−` controls move to adjacent ₹10 multiples

Primary action: **List your Entity**

The interface may show the amount required to claim rank #1 next to the Rank Amount control.

### Minimum publishable entity

After captured payment, RealRank can create a minimal public listing using:

- entity name;
- configured contact method and contact number;
- current total ranking amount; and
- current rank.

The entity may then complete account setup and add:

- a short description;
- one or more categories it deals in;
- logo;
- website or social profile;
- optional portfolio items; and
- additional profile information introduced later.

### Description

- Description appears directly below the entity name on the index card.
- It should remain short enough for one or two lines; **240 characters** is the recommended MVP limit.
- An empty description must not prevent the minimum listing from appearing.

### Categories

Categories describe what the entity deals in. The MVP taxonomy is:

- Residential
- Commercial
- Plots & Land
- Rentals
- New Projects
- Luxury
- Industrial
- Warehouses
- Co-working
- Agricultural
- PG & Hostels
- Farmhouses
- Auction Properties

An entity may select multiple categories for each city in which it is active. Category choices may be corrected by the entity owner or platform moderation if they are misleading.

**Auction Properties** is a secondary specialisation category and belongs in the More category island at launch. It means the entity deals in auction-property opportunities; it does not mean RealRank conducts the auction or accepts property bids. Use **Bank Auction** later as a portfolio-level tag when the auctioning authority is a bank. Keep Rank Amount terminology visually and verbally separate from any bid made to an auctioning authority.

### What the index card does not require

The index does not require or display:

- company sub-locality;
- property count;
- portfolio price range;
- a verification or “Profile claimed” badge;
- individual project information; or
- property availability data.

Detailed properties belong on the optional entity profile, not in the minimum index card.

---

## 4. Index and ranking rules

### Ranking scope

- The launch product has one sponsored index for the selected city.
- There are no sub-locality pools in the MVP.
- **All** shows every listed entity in the selected city.
- Category filters show only city listings that selected that category.
- Rank is recalculated inside the active category view using the same entity ranking total.
- An entity has one ranking total per city, not a separate paid balance for every category.

This model keeps onboarding and payment simple. A future version may introduce category-specific campaigns only if real usage shows that a single city-wide amount is insufficient.

### Permanent cumulative ranking

- There is **no 30-day window, campaign expiry or automatic bid reset**.
- An entity's ranking total remains active unless a refund, chargeback, moderation action or account closure changes it.
- Higher total ranking amount means higher position.
- The minimum amount to move ahead of another entity is ₹1 above that entity's total.
- Example: if rank #1 has ₹1,250, ₹1,251 is required to claim #1.
- If two entities have the same total, the entity that reached that total first remains higher.
- Only successfully captured payments or explicitly issued promotional credits affect rank.

### Top-ups

Existing entities do not repay their full total. They pay only the difference between their current total and the target total.

Example:

```text
Current entity total:          ₹840
Amount required for rank #1: ₹1,251
Top-up payable:                ₹411
New entity total:            ₹1,251
```

The server must recompute the required amount immediately before payment. A displayed position is predictive until payment is captured because another entity may pay first.

### Public disclosure

The index must state:

> Positions are sponsored and ordered by Rank total—not by quality, reviews, recommendation or business verification.

Do not describe an entity as the “best” because it holds a paid position.

---

## 5. Finalized public index experience

### Locked landing-page direction

The locked visual direction is the **Terracotta** wireframe. Keep the palette minimal: warm off-white page background, white listing surfaces, dark neutral text, quiet grey secondary controls, white active category filters outlined and labelled in terracotta, and terracotta reserved for brand emphasis, ranking accents and the primary listing action.

The landing page has four parts only:

1. compact navigation;
2. hero with the payment-first listing form;
3. category-filtered index; and
4. restrained legal and support footer.

Do not add generic feature grids, testimonial carousels, newsletter forms or repeated promotional CTAs to the MVP landing page.

### Header and hero

Header navigation contains:

- RealRank wordmark;
- Categories;
- How it works;
- Login; and
- a custom city selector with Indore selected and other cities marked Coming soon.

Locked hero headline:

> The Real Estate Discovery Index of Companies & Marketers.

The launch-status pill reads **Now live in Indore · Rankings update instantly**. Do not place a visitor, concurrent-user or entity-count claim in this pill unless it is calculated from genuine production data.

Locked hero paragraph:

> Where real estate companies and marketers claim prime digital visibility across leading property categories. Bid transparently, showcase live portfolios, and connect directly with high-intent property buyers—zero commission fees, zero middleman algorithms.

The full paragraph uses one neutral text style; do not emphasize its opening sentence with a separate bold or accent treatment.

The hero form remains the dominant business-conversion action. Its visible placeholders are Entity Name and Contact or WhatsApp Number, followed by the Rank Amount control and **List your Entity** button. Manual entry accepts any whole-rupee amount of ₹10 or more; the `+` and `−` buttons move to the next higher or lower ₹10 multiple. The floating rank prompt may show the current amount required to claim #1. Align the primary button to the end of its grid area so it remains anchored to the bottom edge of the adjacent form control at responsive breakpoints.

After the entire hero has scrolled above the viewport, show a small bottom-centred **List Your Entity** floating CTA. It returns the user to the hero form, stays hidden while the hero is visible, and hides when the footer enters the viewport so it does not cover footer actions. Respect mobile safe-area spacing and reduced-motion preferences.

### Section title

Use **RealRank Index**. Do not append Indore to this section heading during the single-city launch because the custom city selector and launch-status pill already establish the location. Future city pages retain the same section heading and establish location through their page context.

Supporting explanation:

> Discover real estate companies and marketers, explore portfolios, and connect directly.

Desktop may show the quiet disclosure **Sponsored ranking · not a quality score or recommendation** opposite the heading. Do not show a listing-count label in the index header. Pagination may still communicate the current result range where necessary.

### Category navigation

- Use a horizontally scrollable chip rail similar to YouTube's category navigation.
- Every visible category chip includes an icon.
- Keep the rail usable with touch, trackpad and keyboard.
- Provide a persistent **More** action.
- More opens a compact floating category island on desktop and a bottom-positioned island on mobile.
- Selecting a category from either surface updates the same filter state.
- Show the selected category on a white surface with a thin terracotta outline and terracotta icon and text rather than a solid high-contrast fill. It must remain identifiable without competing with listing and conversion actions.

### Ranking groups

Use restrained milestone groups:

- Top 3 — highest sponsored positions
- Top 10 — #4–10
- Top 20 — #11–20
- All listings — #21 onward

Top-three cards remain white with terracotta borders. Rank #1 may use a slightly stronger border and restrained shadow. Do not use a continuously animated border; permanent motion competes with content and weakens the premium, trustworthy presentation.

Rank numbers are unboxed ordinal labels in a narrow fixed-width left column, using clear 13px semibold terracotta text and tabular numerals with the same treatment at every position, including #1. Keep approximately 10px between the rank and the adjacent logo or company content so they read as one identity group without visually merging. Do not place rank numbers inside pills, circles or button-like containers. They are scannable metadata, not an action or the dominant card element; the top-card border and public Rank total communicate the ranking hierarchy.

### Entity card hierarchy

1. rank number;
2. logo or initials;
3. entity name, opening the public profile;
4. short description directly below the name;
5. selected categories;
6. compact secondary **Contact** action inside the company-information area;
7. public **Rank total** in the top-right; and
8. a small **Claim #N** action badge directly below Rank total.

The Contact action routes directly to the method configured by the entity: call or WhatsApp. Do not add an extra contact-method dropdown on every card.

Contact uses a quiet light-grey background, normal text weight and content-width sizing at every breakpoint. It must not become full width on mobile or visually compete with the ranking action.

Entity categories use plain dark-neutral text at a small readable metadata size and medium weight. Do not render them as terracotta text or individual chips: their typography keeps them secondary while making this important discovery information easy to scan.

The Claim badge remains an actual button but is visually compact. Do not show an arrow icon or the required amount inside the badge; the payment dialog explains the current total and amount required after activation.

Do not show email-confirmation, verification, property-count or portfolio-count signals on the index card.

### Footer

The MVP uses a simple footer with the same page background and one subtle top divider. It contains:

- **RealRank © 2026**;
- **Transparent sponsored discovery for real estate.**; and
- How it works, Ranking Policy, FAQ, Terms, Privacy, Refund Policy and Contact links.

The footer is one restrained horizontal row on desktop and stacks on mobile. Do not add a dark footer surface, newsletter form, social icons without active accounts, or another listing CTA.

### Removed from the launch index

- locality filter and sub-locality labels;
- recent ranking activity;
- verification/profile-claimed badges;
- active property count;
- property price range;
- repeated View profile buttons; and
- animated live reordering.

These removals keep the launch product credible even when entities have completed only minimal onboarding.

---

## 6. Payment-first onboarding

The owner explicitly prefers payment before signup. The safe MVP flow is:

1. Visitor enters entity name, contact number and Rank Amount.
2. Server derives the city from the canonical page context. During the root-only launch this is always Indore; never trust a browser-supplied city ID as authoritative.
3. Server creates a short-lived pending checkout record.
4. Razorpay collects the payment.
5. Server verifies the captured payment through an authenticated webhook.
6. Server creates or updates the entity's city listing and recalculates rank atomically.
7. The minimum listing becomes public.
8. The payment-success screen asks the owner for an email address; this happens only after payment has been captured, so signup does not interrupt checkout.
9. RealRank sends a one-time email OTP. After the owner confirms it, the account is created and linked to the paid entity listing.
10. Owner optionally adds description, city-specific categories, logo, website/social link and portfolio.

If account setup is abandoned, the minimum paid listing can remain live using the submitted name and contact details, subject to moderation and the published privacy terms. The payment-success screen must clearly explain that the listing is already active and how the owner can return to complete email OTP setup. WhatsApp or SMS account-setup delivery is deferred until RealRank has an approved provider, explicit user consent and enough operational need to justify the additional integration.

### Ownership model

- One owner manages each entity in the MVP.
- Team members, roles and shared permissions are deferred.
- Email confirms access to the account; it is not business verification.

---

## 7. Trust, verification and moderation

### MVP trust position

RealRank does not offer formal entity verification at launch.

- Do not show “Verified,” “Profile claimed,” “RERA verified,” or similar badges.
- A ₹10 payment is an anti-spam and payment-pipeline gate, not identity verification.
- Email access is account authentication, not verification of the company.
- Ranking position must never be presented as a recommendation.

### Minimum moderation

Even without formal verification, publication needs basic protections:

- normalized and rate-limited contact numbers;
- duplicate-entity review;
- prohibited-content rules;
- category correction;
- impersonation and takedown reporting;
- payment fraud and chargeback handling; and
- an audit trail for administrative changes.

All public activity and social-proof metrics must be genuine, reproducible and clearly labelled. Never seed fabricated visitor counts, concurrent-viewer counts, contact clicks, entity totals or ranking activity. When real analytics become meaningful, prefer precisely defined metrics such as profile visits or contact clicks and exclude bots and internal testing.

Formal business-document, RERA or authorization checks may be introduced later as separate, precisely named trust signals.

---

## 8. Portfolio model

The portfolio is optional and belongs to the entity profile, not to a temporary ranking campaign.

### MVP portfolio behavior

- An entity may have zero or more portfolio items.
- A company or marketer manages its own separate portfolio.
- Multiple entities may legitimately market similar or identical projects; RealRank does not enforce project exclusivity in the MVP.
- Portfolio completion does not affect rank.
- The index does not display property count or price range.

### Suggested optional portfolio fields

- title;
- property type/category;
- brief description;
- image;
- external website or social URL;
- optional price text;
- optional contact CTA; and
- last updated time.

Do not require complete property data before an entity can participate in the index.

---

## 9. Notifications

### MVP notification events

- payment captured;
- listing published;
- entity moved down from a selected watched position;
- a target top-up amount is available; and
- account-setup reminder.

Outbid alerts should show:

- current position;
- current ranking total;
- total required to reclaim the intended position; and
- a short-lived signed link that recomputes the payable top-up.

Notifications should be opt-in, rate-limited and sent through the entity's chosen channel. There are no expiry or renewal reminders because ranking totals do not expire.

---

## 10. Nationwide expansion, routes and discoverability

The brand and hero remain location-neutral. City context is supplied by the city selector and page metadata.

### Rollout

- At launch, `/` directly serves the complete Indore landing page and index. It is self-canonical; do not redirect visitors to `/indore` and do not publish a duplicate `/indore` page yet.
- Show other cities as Coming soon until they have enough real entities to support a useful index.
- Keep all ranking, payment and category records scoped to Indore's city ID even though the public page is `/`.
- When the second city launches, move the Indore city experience to `/indore`, turn `/` into the nationwide city-discovery page and add the new `/{city}` page in the same release.
- Expand city by city across India without changing the core headline or entity URLs.

### Launch route structure — Indore only

```text
/
/indore/category/{category-slug}
/entity/{entity-slug}
/entity/{entity-slug}/portfolio/{item-slug}
/how-it-works
/ranking-policy
/faq
/terms
/privacy
/refund-policy
/contact
```

Examples:

```text
/
/indore/category/commercial
/indore/category/auction-properties
/entity/apollo-realty
/entity/apollo-realty/portfolio/green-park-residences
```

At launch, `/` means the active Indore experience. The custom selector and page content make that context explicit. City-qualified category routes begin with `/indore/` immediately so those URLs will not need to move later. Breadcrumbs on those pages link Indore back to `/` during the single-city phase.

### Route structure after the second city launches

```text
/
/{city}
/{city}/category/{category-slug}
/entity/{entity-slug}
/entity/{entity-slug}/portfolio/{item-slug}
```

At that transition, `/` becomes a nationwide discovery and city-selection page, while the Indore index moves to the new self-canonical `/indore` page. Update navigation, breadcrumbs, canonicals and the XML sitemap together. Do not keep the complete Indore index duplicated on `/`. Indore's existing `/indore/category/...` URLs and all `/entity/...` URLs remain unchanged.

This is an intentional early-stage content move rather than a redirect: `/` must remain available for the new nationwide page. Because the transition happens while the product is still young, the launch simplicity is worth the later one-page URL change. Entity profiles remain outside city paths because one entity may eventually operate in several cities.

Keep slugs lowercase, descriptive and hyphen-separated. Reserve static words such as `entity`, `faq`, `terms`, `privacy`, `contact` and `ranking-policy` so they cannot be used as city slugs. The words in a route are less important than stability, crawlability and useful page content; do not change canonical routes merely to add more keywords.

### Indexation policy

| Page type | Indexing rule |
|---|---|
| Home during Indore-only launch | Index as the canonical Indore landing page |
| Home after multi-city expansion | Index as the national city-discovery page |
| Launched city route | Index when it contains real entities and unique city context; Indore uses `/` until expansion |
| Approved city + category | Index only when the combination has enough real supply to be useful |
| Coming-soon or empty city/category | `noindex`; exclude from XML sitemaps |
| Entity profile | Index after publication and minimum content/moderation checks |
| Substantive portfolio item | Index when current, unique and publicly useful |
| Internal search, checkout, login, owner dashboard and admin | `noindex`; keep private routes authenticated |
| Temporary sort, contact-method or combined-filter URLs | Do not index; canonicalize to the closest stable city or category page |

The operating threshold for a new city/category page should begin at **five genuine published entities**, plus useful unique context and working internal links. Five is a product-quality threshold, not a search-engine ranking rule. Do not create sub-locality pages in the MVP.

In production, visible category chips should be crawlable `<a href>` links to approved category routes. JavaScript may enhance their behavior, but it must not be the only way to reach the category content. Filters that do not deserve landing pages may remain transient UI state.

Pagination must use real sequential links and stable URLs such as `?page=2`. Each page has its own canonical URL and must not canonicalize back to page 1 when its entity set differs. Do not rely only on Load more or infinite-scroll buttons because crawlers do not trigger user actions consistently.

### Page titles and on-page geography

Recommended patterns:

```text
Home during launch: Real Estate Companies & Marketers in Indore | RealRank
Home after expansion: RealRank — Real Estate Companies & Portfolio Discovery
City: Real Estate Companies in Indore | RealRank
Category: Auction Property Companies & Marketers in Indore | RealRank
Entity: Apollo Realty — Portfolio & Contact | RealRank
Portfolio item: Green Park Residences by Apollo Realty | RealRank
```

Do not use “best,” “top-rated,” “verified,” or an entity's sponsored position in title tags unless the visible page explains the paid nature immediately. A city/category page should contain a unique H1, short useful introduction, breadcrumb, actual matching entities and a visible sponsored-ranking explanation.

For local/geographic relevance:

- put the selected city in the page title, metadata, visible page context, breadcrumbs and internal links; the locked brand-level hero headline may remain location-neutral;
- store an entity's `areaServed` separately from its office address;
- publish an address, phone number or business hours only when the entity supplied them and they are visible on the page;
- label unverified entity-supplied facts accurately; and
- never generate fake office locations or near-duplicate city pages.

If Hindi pages are introduced later, use dedicated language routes such as `/hi/indore` and reciprocal `hreflang` annotations. Do not create a Hindi URL when only the navigation is translated; the main content must also be translated.

### Technical SEO and freshness

- Server-render or pre-render the public index, category, entity and portfolio content. Client-side interaction may hydrate afterward.
- Give every public page a unique title, meta description, canonical URL, H1 and share image where useful.
- Use ordinary crawlable links for entities, categories, breadcrumbs and pagination.
- Generate a root XML sitemap containing only canonical, indexable URLs. Split it into city, entity and portfolio sitemaps when volume warrants it.
- Set `lastmod` only for meaningful content changes such as publication, profile edits, portfolio updates or removals. Do not update it for every rank movement, page view or copyright-year change.
- Use IndexNow when a canonical public URL is published, materially updated or removed. An index position or Rank total change alone is not a reason to submit the URL again.
- Keep one URL policy for trailing slashes, lowercase and redirects. Permanently redirect retired slugs and preserve canonical history.
- Verify the property in Google Search Console and Bing Webmaster Tools before launch and monitor indexing, structured-data and page-experience errors.

### Structured data

Structured data must describe visible facts and must never convert a sponsored position into a quality claim.

- Home/About: `Organization` for RealRank and `WebSite` for the site identity.
- City/category pages: `CollectionPage`, a visible `ItemList` and `BreadcrumbList` where accurate. These clarify meaning but do not guarantee a rich result.
- Entity page: `Organization`, or `LocalBusiness` only when a real public business location is shown. Do not use Google's `ProfilePage` feature markup for unrelated third-party businesses presented by a directory.
- Portfolio item: use ordinary page markup and only applicable schema.org types whose properties are visible. Do not promise a Google rich result for a generic real-estate listing or auction property.

Validate representative templates before rolling markup out across every page.

### Generative search and LLM discoverability

Treat GEO/AEO/LLMO as an extension of sound SEO, not a separate collection of hacks. Google states that its generative search features use the same crawlability, indexing and quality foundations as Search, while Bing applies the same principles to Copilot grounding.

- Keep essential facts in readable server-rendered HTML: entity name, city/service area, categories, description, Rank total, sponsorship disclosure, contact method and profile-updated date.
- Make `/ranking-policy`, `/how-it-works` and `/faq` concise, explicit and independently understandable. Explain exactly what Rank total means and what RealRank does not verify.
- Separate RealRank-authored facts from entity-supplied claims. For auction portfolio items, display the auctioning authority, source URL, auction date, reserve-price status and last-confirmed time when supplied.
- Use semantic headings, tables only for real comparisons, descriptive link text and accurate image alt text.
- Allow `OAI-SearchBot` in `robots.txt` if RealRank wants eligibility for ChatGPT search citations. The choice to allow or disallow `GPTBot` for model training is separate.
- Confirm that CDN/WAF bot protection does not block search crawlers from public pages.
- Track referral traffic from AI search separately; ChatGPT search referrals include `utm_source=chatgpt.com`.
- Do not add `llms.txt` to the MVP as an assumed ranking requirement. Google explicitly says it does not use such files for generative search, and OpenAI's publisher guidance does not require one.

Primary implementation references: [Google generative-search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide), [Google URL guidance](https://developers.google.com/search/docs/crawling-indexing/url-structure), [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics), [Google pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading), [Google sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [Google LocalBusiness markup](https://developers.google.com/search/docs/appearance/structured-data/local-business), [Google ProfilePage limitations](https://developers.google.com/search/docs/appearance/structured-data/profile-page), [Bing webmaster guidelines](https://www.bing.com/webmasters/help/webmaster-guidelines-30fba23a), [Bing IndexNow](https://www.bing.com/webmasters/help/indexnow-0z209wby), and [OpenAI publisher guidance](https://help.openai.com/en/articles/12627856).

---

## 11. Recommended data model

Store money as integer paise and treat the payment ledger as immutable.

### Core records

**users**

- id
- email
- account status
- created time

**entities**

- id
- owner user id, nullable until post-payment setup
- public name
- public slug
- short description, nullable
- logo URL, nullable
- website/social URL, nullable
- configured contact method: CALL or WHATSAPP
- contact number
- moderation status
- created and updated times

**cities**

- id
- name
- state
- slug
- launch status

**city_listings**

- id
- entity id
- city id
- contact method override, nullable
- contact number override, nullable
- total ranking credit in paise
- ranking-total reached time for tie-breaking
- publication status
- created and updated times
- unique entity + city

**categories**

- id
- name
- slug
- icon key
- display order
- active status

**city_listing_categories**

- city listing id
- category id
- unique city listing + category

**ranking_contributions**

- id
- city listing id
- amount in paise
- source: PAYMENT or PROMOTIONAL_CREDIT
- payment id, nullable for promotion
- reason/code, nullable
- created time
- reversal reference, nullable

**payments**

- id
- pending checkout id
- entity/city listing reference
- gateway order id
- gateway payment id
- amount in paise
- status
- captured time
- webhook idempotency key
- refund/chargeback state

**portfolio_items**

- id
- entity id
- title
- public slug
- category id, nullable
- description, nullable
- image and external URL fields, nullable
- price display, nullable
- publication status
- last updated time
- auctioning authority, source URL, auction date, reserve-price display and last-confirmed time, all nullable and used only for auction opportunities

**portfolio_item_cities**

- portfolio item id
- city id
- unique portfolio item + city

### Derived ranking

Overall city ranking:

```text
ORDER BY total_ranking_credit_paise DESC,
         ranking_total_reached_at ASC,
         city_listing_id ASC
```

Category ranking uses the same order after joining through `city_listing_categories`.

Payments, promotional credits and reversals should update the cached city-listing total inside one database transaction. The immutable contribution ledger remains the financial source of truth.

---

## 12. Technical direction

RealRank begins as a modular monolith: one web application, one transactional PostgreSQL database and one payment integration. Do not introduce microservices, a separate search service or multiple backend runtimes for the MVP.

### Locked implementation stack

| Layer | Direction |
|---|---|
| Web application | Supported stable Next.js App Router release selected at implementation time |
| Language | TypeScript |
| Styling | CSS Modules with CSS custom-property design tokens; restrained motion only |
| Icons | Lucide React, using one consistent stroke weight and only the icons required by the interface |
| Validation | Zod schemas shared by forms, route handlers and server-side business logic |
| Database access | Drizzle ORM and version-controlled PostgreSQL migrations |
| Database | Supabase PostgreSQL, created in the Mumbai region |
| Authentication | Supabase Auth with email OTP after captured payment |
| Media storage | Cloudflare R2 for entity logos and portfolio images |
| Payments | Razorpay Orders, Checkout, captured-payment webhooks and idempotent processing |
| Search | PostgreSQL full-text search and trigram matching when text search is introduced |
| Bot protection | Cloudflare Turnstile on listing and checkout-initiation endpoints |
| DNS and edge protection | Cloudflare DNS, CDN and appropriate WAF controls |
| Product analytics | PostHog for explicitly defined product events and conversion funnels |
| Aggregate traffic | Cloudflare Web Analytics may remain enabled as an infrastructure-level traffic view |
| Error monitoring | Sentry or an equivalent error-monitoring service before public payment launch |
| Transactional email | Supabase Auth through a production custom SMTP provider |
| Unit and integration testing | Vitest for ranking, payment, validation and data-access rules |
| Browser testing | Playwright for responsive discovery, listing, checkout-return and account-setup journeys |
| Continuous integration | GitHub Actions running formatting, linting, type checks and tests before deployment |
| Hosting during development | Vercel Hobby for personal, non-commercial development and previews only |
| Hosting for paid public launch | Vercel Pro, with application compute located as close as practical to the Mumbai database |
| Notifications | Email first; WhatsApp or SMS only after explicit opt-in and an approved provider integration |

Vercel Hobby must not serve the commercial version of RealRank. Upgrade before enabling real ranking payments. Supabase Free and Cloudflare free allowances may be used during development and a controlled early launch, but payment data must always have a tested, recoverable backup. Supabase Free does not provide the production backup guarantees required for meaningful paid volume; upgrade or establish automated encrypted PostgreSQL backups before accepting material transaction volume.

### Rendering and component boundaries

- Render public landing, city, category, entity and portfolio content with Server Components by default.
- Use Client Components only where browser state or event handlers are required, including category controls, amount controls, dialogs and interactive form steps.
- Keep payment calculation, authorization, ranking updates and ownership checks exclusively on the server.
- Do not turn the entire page into a Client Component for convenience; preserving server-rendered content reduces browser JavaScript and supports crawlability.

### Analytics policy

PostHog is the primary source for product and conversion-funnel analysis. Cloudflare Web Analytics may provide an independent aggregate traffic view, but it is not the source of truth for product behavior.

Begin with an explicit event allowlist rather than automatic capture. Useful MVP events include category selection, entity-profile view, portfolio-item view, Contact click, Claim click, listing start, checkout start, captured payment, email-OTP completion and profile completion.

- Never send phone numbers, email addresses, names, payment IDs, gateway payloads, contact messages or other sensitive fields to PostHog.
- Use a random internal identifier only after an owner authenticates; keep public visitors anonymous.
- Emit captured-payment and refund events from verified server-side processing, not from browser callbacks.
- Keep session replay disabled at launch. If introduced later, mask all text inputs and verify that payment and authentication surfaces are excluded before enabling it for real traffic.
- Do not expose PostHog or Cloudflare estimates as a public live-viewer count.
- Analytics must never become the financial or ranking source of truth; PostgreSQL remains authoritative.

### Cloudflare responsibilities

- Store logos, portfolio images and encrypted database backup files in R2.
- Generate short-lived R2 presigned upload URLs on the RealRank server so files upload directly from the browser without exposing R2 credentials.
- Validate file type, size and ownership before issuing an upload URL; use unpredictable object keys.
- Keep file metadata, ownership, moderation status and public URLs in PostgreSQL.
- Publish only approved media through the configured public delivery domain.
- Use Turnstile and rate limits to reduce automated pending-checkout and form abuse.
- Use genuine analytics only; never turn estimated or sampled traffic into a live social-proof claim.

Do not store payments, ranking totals, promotional credits, refunds, entity ownership, categories, contact details or webhook state in R2, KV or analytics systems. These records belong in PostgreSQL. Cloudflare D1 is not the MVP system of record because RealRank's ranking and financial ledger need one clearly authoritative transactional database.

Prefix RealRank-owned CSS classes with `rr-` to avoid collisions when wireframe patterns are moved into the production application. IDs, data attributes and third-party classes follow their own conventions.

The server is authoritative for rank. Client-side optimistic movement must not imply that an uncaptured payment has secured a position.

### Payment safeguards

- Never trust an amount supplied only by the browser or URL.
- Create a server-side order from a freshly computed target.
- Verify webhook signatures.
- Process gateway events idempotently and tolerate out-of-order delivery.
- Apply ranking credit only after captured payment.
- Preserve payment and contribution records after entity deletion.
- Handle refunds and chargebacks as explicit reversing contributions.

---

## 13. MVP scope

### Include

- location-neutral landing page served at `/`, with Indore as the explicit launch context;
- city selector with future cities marked Coming soon;
- three-field payment-first listing form;
- ₹10 minimum, free whole-rupee entry and adjacent-₹10 stepper controls;
- permanent cumulative ranking totals;
- RealRank Index with category filters;
- horizontal category rail and More category island;
- Auction Properties as a secondary category inside More, with no auction conducted by RealRank;
- balanced entity cards with name, description, categories, compact Contact action, rank, top-right Rank total and compact Claim badge;
- entity profile with optional portfolio;
- responsive payment review, delayed-confirmation and failure states, with Razorpay owning payment-method collection;
- Razorpay captured-payment processing;
- post-payment one-owner account setup;
- owner dashboard for profile, contact preference, categories, portfolio and ranking top-ups;
- transparent ranking policy and sponsored disclosure;
- restrained legal and support footer;
- pagination;
- basic moderation and duplicate handling; and
- payment, publication and outbid notifications.

### Defer

- sub-locality pools and locality filters;
- 30-day ranking windows, expiry or renewal;
- subscriptions;
- formal verification badges;
- reviews and ratings;
- mandatory RERA checks;
- required property counts and price ranges;
- project deduplication or exclusivity;
- multiple staff accounts;
- recent-activity feeds before genuine activity exists;
- animated rank borders or automatic card reordering;
- QR rank awards;
- property-level programmatic SEO at scale; and
- multi-city launch before supply is seeded.

---

## 14. Finalized terminology

| Use | Avoid |
|---|---|
| RealRank Index | Leaderboard or best real-estate company as the public section label |
| Sponsored position | Verified rank |
| Rank Amount (payment control) / Rank total (public cumulative amount) | Bid Amount, Active Rank, Ranking Value or quality score |
| Entity, company, marketer | Broker as the default umbrella term |
| Entity profile and optional portfolio | Mandatory live inventory |
| Contact | Lead sold by RealRank |
| Promotional ranking credit | Paid ₹10 when a coupon funded it |

---

## 15. Superseded decisions

The following concepts from earlier drafts are no longer part of the current MVP:

- “Pay-to-Rank” in the hero headline;
- “Index & Portfolio Hub” and “Search Index” as the hero positioning;
- Indore in the permanent brand headline;
- category + sub-locality pools;
- one paid listing per locality pool;
- 30-day bid expiry or hard reset;
- payment presented as identity verification;
- “Profile claimed” or verification badges;
- required portfolio completion before listing;
- property count and price range on index cards;
- email-confirmation and portfolio-count signals on index cards;
- a high-contrast or full-width Contact button on index cards;
- a large Claim button with an arrow or required amount inside it;
- a ranking-rules strip above the cards;
- recent ranking activity at launch; and
- project-level ranking.

If an older research note, wireframe or specification conflicts with this document, this master plan takes precedence.
