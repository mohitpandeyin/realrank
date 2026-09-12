> **Historical research note:** This document records the initial Outbid analysis and early recommendations. Several recommendations—particularly locality pools, rolling 30-day contributions, launch verification and required property examples—were later rejected or deferred. The current [RealRank master product plan](../realrank_master_product_plan.md) is the authoritative source of product and business rules.

## Locked product direction — 9 September 2026

The current locked implementation reference is the [Terracotta landing wireframe](wireframes/realrank-locked-terracotta.html). Draft supporting flows are available for [payment states](wireframes/realrank-payment-states.html), [payment success and email OTP](wireframes/realrank-payment-success-otp.html), the [owner dashboard](wireframes/realrank-owner-dashboard.html), and the [public entity profile](wireframes/realrank-entity-profile.html); they remain review drafts until approved. The following decisions supersede conflicting recommendations later in this historical research note:

- The public headline is **“The Real Estate Discovery Index of Companies & Marketers.”**
- The launch-status pill reads **“Now live in Indore · Rankings update instantly.”** Fabricated visitor, concurrent-viewer or activity numbers are not permitted; numerical social proof may appear later only when derived from genuine production data.
- The hero paragraph is: **“Where real estate companies and marketers claim prime digital visibility across leading property categories. Bid transparently, showcase live portfolios, and connect directly with high-intent property buyers—zero commission fees, zero middleman algorithms.”** It uses one neutral text style without an emphasized opening sentence.
- The conversion form contains Entity Name, Contact or WhatsApp Number and **Rank Amount**, with a ₹10 minimum and **List your Entity** as the action. Typed amounts may be any whole-rupee value; `+` moves to the next higher ₹10 multiple and `−` to the next lower ₹10 multiple. The primary action is end-aligned within its responsive grid area.
- A small bottom-centred **List Your Entity** CTA appears only after the hero has fully scrolled away, returns the user to the form, and hides when the hero or footer is visible.
- Account setup remains post-payment: after capture, the success screen collects the owner's email, sends a one-time email OTP and links the confirmed account to the already-paid listing. WhatsApp or SMS setup delivery is deferred until there is an approved provider, consent and demonstrated need.
- The public section is called **RealRank Index** and is introduced with **“Discover real estate companies and marketers, explore portfolios, and connect directly.”** Indore is not repeated in the section heading because the city selector and launch-status pill already establish the location.
- The launch index is city-wide and category-filtered. It does not use sub-locality pools or a locality filter.
- Categories appear in a horizontally scrollable icon-chip rail with a persistent More category island.
- The selected category uses a white surface with a thin terracotta outline and terracotta icon and text instead of a solid orange or black fill.
- **Auction Properties** is included as a secondary category inside More. It describes entities that handle auction opportunities; RealRank does not conduct property auctions or accept property-auction bids.
- Results are grouped as Top 3, Top 10, Top 20 and All listings.
- The balanced card keeps the description and categories below the entity name, places a compact light-grey Contact action inside the company-information area, and places **Rank total** in the top-right.
- Rank numbers use clear 13px unboxed terracotta ordinal labels in a narrow fixed-width column across every position, including #1. Keep approximately 10px to the adjacent logo or company content. Pills, circles and other button-like containers are avoided; card borders and Rank total carry the hierarchy.
- **Claim #N** is a small badge below Rank total. It does not repeat an arrow, icon or required amount; those details belong in the payment dialog.
- Cards do not show verification/profile-claimed badges, email-confirmation signals, property counts, portfolio counts, price ranges or sub-locality labels.
- The launch page does not include a recent-activity feed or a ranking-rules strip above the cards. A concise sponsored-ranking disclosure remains part of the page and policy.
- The footer is deliberately small: RealRank © 2026, a one-line transparency statement, and How it works, Ranking Policy, FAQ, Terms, Privacy, Refund Policy and Contact links.
- During the Indore-only launch, `/` is the self-canonical Indore landing page and index; there is no duplicate `/indore` page. Category URLs are city-qualified from day one, such as `/indore/category/auction-properties`, while entity profiles remain city-independent at `/entity/{entity-slug}`. When a second city launches, `/` becomes national discovery and Indore moves to `/indore`; category and entity URLs remain unchanged. Thin combinations and transient filters are not indexable.
- Categories are attached to each city listing rather than globally to the entity. Rank totals and ranking payments are also city-specific, while the owner account and canonical entity profile remain shared.
- RealRank-owned CSS classes use the `rr-` prefix throughout the locked wireframe; IDs, data attributes and third-party classes retain their own naming conventions.
- The locked low-cost stack is Next.js App Router and TypeScript on Vercel, CSS Modules and design tokens, Lucide React, Zod, Supabase PostgreSQL/Auth in Mumbai, Drizzle ORM, Razorpay, Cloudflare R2/Turnstile/DNS, PostHog, Vitest, Playwright and GitHub Actions. Public content is server-rendered by default; Client Components are limited to interactive controls. Vercel Hobby is limited to non-commercial development, and RealRank moves to Vercel Pro before enabling real ranking payments. R2 stores media and encrypted backups only, while PostgreSQL remains authoritative for payments, ranking, ownership and contact data.
- PostHog is the primary product and funnel analytics system, with Cloudflare Web Analytics retained only as an optional aggregate traffic view. Analytics uses an explicit event allowlist, excludes personal/payment data and keeps session replay disabled at launch.

Everything below this point is retained as research history and should not be treated as an implementation specification when it conflicts with the master plan or locked wireframe.

I reviewed the live Outbid product, its rules, category and detail pages, bidding interactions, responsive structure, and the original RealRank plan. No implementation changes were made during that research stage.

## Executive verdict

RealRank has a promising mechanic, but the current plan transfers Outbid’s model too literally into a market where “rank” carries much more trust and legal weight.

Outbid is fundamentally an attention auction. RealRank needs to become a trusted real-estate discovery product with a transparent paid-placement layer.

The most important changes are:

- Never imply that the highest bidder is the “best” agency. Call it a sponsored or paid rank everywhere.
- Separate payment, identity verification, RERA verification, and listing freshness. They prove different things.
- Replace the hard listing-wide 30-day reset with rolling 30-day bid contributions.
- Rank an entity’s sponsored placement, not its underlying properties.
- Maintain canonical projects/properties separately from the brokers or developers marketing them.
- Make public discovery intent-first—category, locality, budget, property type—with ranking as one component.
- Launch with one strong commercial use case and a few atomic localities, not all proposed categories and 1,000 SEO pages.
- Rebuild the proposed data model around organizations, users, projects, offers, placements, verification evidence, and an immutable payment ledger.

## 1. What Outbid actually is

Outbid is deliberately minimal: a public marketplace where visibility is purchased directly. Its own rule is effectively “rank equals bid,” without a quality score, revenue share, or traditional ad inventory. [Outbid rules](https://outbid.lol/rules)

It is also extremely new: its About page says it launched on August 19, 2026. That makes it a useful interaction experiment, but not yet evidence of long-term marketplace retention or sustainable bidder economics. [Outbid About](https://outbid.lol/about)

### Core model

Outbid has two interconnected boards:

- All-time: cumulative spend determines rank.
- Today: each payment contributes for a rolling 24 hours, then drops out; the same payment also increases the all-time amount.

New listings start at $5. To take #1, the bid must be at least $5 above the leader. Lower bids can still purchase whatever position they qualify for. Equal bids retain chronological order, with the older bid higher.

An existing listing is increased by submitting the same URL or handle, and only the difference is paid.

The business model is therefore very direct: every successful payment is revenue, while traffic and public click counts create the perceived value of rank.

### Public journey

The live journey is:

1. Arrive on the leaderboard.
2. Immediately see the current cost of #1.
3. Enter a URL or social handle.
4. Select a category.
5. Accept the suggested bid or change the amount.
6. Complete payment.
7. Appear at the corresponding rank.
8. Return later and enter the same identity to increase the bid.

Browsing does not require an account.

### Information architecture

The main hierarchy is:

- Global navigation: Leaderboard, Categories, About
- Ranking timeframe: All-time or Today
- Current traffic/social proof
- “Claim #1” bid form
- Category shortcuts
- Ranked feed
- Recent activity inserted near the top
- Pagination
- Revenue/traction evidence and customer testimonials

This works because the product explains itself before requiring the user to explore documentation.

### Listing/card structure

Each card exposes:

- Exact rank
- Product logo
- Name
- Public bid amount
- Short description
- Time since activity
- Domain
- Category
- Click count
- Detail-page link
- Exact next outbid amount

The detail page adds:

- Total spent
- Category rank and pool size
- Overall rank and pool size
- Visit CTA
- Outbid CTA
- Share action

This is a strong information hierarchy for an attention marketplace: value, price, proof, and action are visible without opening the item. [Example Outbid detail page](https://outbid.lol/product/see.io)

### Why its conversion pattern works

- The price of the desired outcome is visible upfront.
- The form defaults to a qualifying amount.
- The increment/decrement controls make bidding feel tangible.
- Paying less than the top amount is explicitly allowed.
- Every ranked card contains a contextual outbid price.
- Public activity, visitor counts, click counts, and testimonials reduce uncertainty.
- The mechanism is consistent across global and category rankings.

The product does not make the user learn auction terminology. It presents a simple purchase: “pay this amount to reach this position.”

### Trust and transparency

Outbid’s strongest trust mechanisms are procedural, not identity-based:

- Public rules
- Public bid amounts
- Public timestamps
- Public click counts
- Public rank counts
- Live activity feed
- Separate category and overall rank
- Explicit tie-breaking and minimum-bid rules
- Clear statement that rank is purchased

Its weaker areas are ownership verification, content quality, category disputes, refunds, moderation transparency, and whether click/ROI claims are independently audited.

### Important states handled by its rules

Outbid explicitly addresses:

- Minimum and maximum bids
- Whole-dollar increments
- Bids below the top price
- Ties
- Existing-listing top-ups
- Rolling-window expiry
- URL normalization
- Tracking-query removal
- Link shorteners
- Platform links whose path identifies a specific product
- Disallowed chat and adult-content links
- AI-assigned category corrections
- Payment completion as the event that claims rank

These rules are part of the product, not merely legal footer content.

## 2. Outbid’s UI from a 2026 perspective

### What remains effective

- Exceptional concept-to-interface alignment
- Very low browsing and submission friction
- Strong numeric hierarchy
- Visible mechanics instead of opaque algorithms
- Good progressive disclosure from card to detail page
- Useful category pages with category-specific bidding
- Accessible public rules
- Dark-mode support
- Social and market activity close to the conversion point

### What is below mature marketplace standards

- Paid results and discovery content are effectively the same thing.
- The global board compares unrelated products.
- There is no meaningful search, filtering, comparison, or saved discovery.
- Category navigation becomes horizontally dense.
- Cards become repetitive and information-heavy.
- “All-time” versus rolling “Today” requires more explanation than the visual toggle provides.
- The activity feed interrupts the ranking after the first few results.
- Ownership and listing authorization are not prominent.
- Click counts measure traffic, not business value or qualified conversions.
- Aggressive live movement could become distracting if the product grows.
- The visual styling is polished, but the warm pastel palette and small secondary text can create contrast/readability concerns.

I visually validated the desktop product. The live responsive stylesheet contains standard mobile/tablet breakpoints, but the browser’s device-size override did not produce a reliable phone capture; therefore, I would treat the mobile evaluation as structural rather than a full device QA pass. The likely pressure points are the header, category rail, bid form, long card copy, and competing bidder-versus-customer CTAs.

## 3. Where the Outbid analogy breaks

Outbid listings are low-risk external links. A visitor can click, evaluate the product, and leave.

Real estate is different:

- The inventory changes or sells.
- Multiple brokers may legitimately market the same project.
- Agent and project registrations matter.
- Location, budget, availability, possession status, and authorization matter more than bidder spend.
- A consumer can reasonably interpret “#1 real-estate agency” as an endorsement.
- A lead may take weeks to convert, so bidder ROI is harder to establish.
- The highest bidder may be less relevant than a lower-ranked specialist.

RealRank therefore cannot let the auction become the complete discovery algorithm.

## 4. Existing plan → recommendation → reason

| Existing plan | Recommendation | Reason |
|---|---|---|
| “Claim the #1 Spot in Indore Real Estate” | Use “#1 sponsored position” or “paid rank” consistently | “#1 agency” implies quality. India’s dark-pattern guidance explicitly treats advertising disguised as ordinary content as problematic, so paid placement must be conspicuous. [Department of Consumer Affairs guidance](https://consumeraffairs.nic.in/sites/default/files/file-uploads/latestnews/central-consumer-protection-authority-dark-patterns-guidelines-watermark-1565354.pdf) |
| ₹10 payment is identity verification | Treat it only as an activation payment or minimum bid; create separate verification levels | A successful UPI payment does not verify business ownership, RERA registration, project authorization, or listing accuracy. |
| Open, permissionless publication | Allow open application, but gate publication through phone verification and basic moderation | “Permissionless” and “high-trust real-estate directory” conflict. |
| One listing per pool | Retain one sponsored entity placement per pool | This is a useful anti-monopoly rule, but the ranked object should be a placement, not a property listing. |
| Bundled corridor-based localities | Model atomic localities and separately configured pools | “Vijay Nagar,” “AB Road,” and “Super Corridor” should be reusable geo entities. Pool groupings can change without rewriting listings. |
| Properties cannot be listed by multiple brokers | Create one canonical project/property with multiple authorized offers | Multiple channel partners may legitimately market one project. Deduplicate the asset, not the seller relationship. |
| Entity portfolio belongs to a pool listing | Attach portfolio to the entity and canonical properties; select relevant offers for each placement | Properties should not disappear or duplicate when a campaign expires or the entity enters another pool. |
| Hard reset of the entire bid after 30 days | Use rolling 30-day contributions: every captured payment contributes for exactly 30 days | This avoids a cliff where a day-29 top-up becomes nearly worthless. It also mirrors Outbid’s understandable rolling 24-hour mechanism. |
| Rank reset purges sold inventory | Separate bid expiry from inventory freshness | Money expiry cannot prove that a property is available. Require explicit availability reconfirmation. |
| ₹1-style incremental outbidding | Introduce a meaningful minimum top-up and a separate minimum step for taking #1 | Tiny increments create notification wars and poor payment economics. |
| Instant rank after checkout | Rank only after server-side captured-payment verification | Razorpay documents late authorizations, duplicate events, and out-of-order webhooks. [Payment states](https://razorpay.com/docs/webhooks/payments/), [webhook validation and idempotency](https://razorpay.com/docs/webhooks/validate-test/) |
| Raw top-up URL containing listing ID and amount | Use a short-lived signed link that recomputes the required amount | Query parameters must not be trusted as the payable amount or authorization mechanism. |
| Notify immediately whenever #1 is lost | Add opt-in, debouncing, quiet hours, and notification thresholds | Rapid bidding could produce WhatsApp spam and opt-outs. |
| Public phone and WhatsApp by default | Require explicit business consent and track contact clicks without exposing unnecessary personal information | Business and personal numbers may differ; public contact publication is a privacy decision. |
| `RealEstateListing` guarantees Google visibility | Use only applicable schema and do not promise a rich result | Google’s supported gallery currently includes LocalBusiness, Organization, Product and other types, but not a generic real-estate-listing rich result. [Google structured-data gallery](https://developers.google.com/search/docs/appearance/structured-data/search-gallery) |
| Index every generated page | Index only substantive, current pages; noindex thin, empty, expired, or duplicate pages | A thousand low-value pages can become an SEO liability rather than an asset. |
| Next.js 15 fixed in the specification | Select a supported, patched version at implementation time | Next.js 16.3 is current, while both 16.3 and 15.5 have an announced August 2026 security update. Pinning an old major in the product plan is unnecessary. [Next.js releases](https://nextjs.org/blog) |
| Vercel + Cloudflare for sub-50 ms TTFB | Start with one delivery/cache layer and measure actual Indian performance | Dual CDN configuration adds caching and invalidation complexity without proving user value. |
| Realtime animated reorder | Keep the server authoritative; show a restrained “rankings updated” state | Cards moving while someone is reading or contacting a business is disorienting, particularly on mobile. |
| QR standee saying “Ranked #1 Real Estate Agency” | Say “#1 sponsored position in [pool], as of [date]” | The current wording could be interpreted as RealRank endorsing overall quality. |
| Four categories and many pools at launch | Launch one vertical with two or three localities | Thin pools produce meaningless rankings and weak bidding pressure. |

## 5. Specific problems in the proposed schema

The current database section should be treated as an early sketch, not a complete schema. [Current schema](/Users/mohit-15993/sites/realrank/realrank_master_product_plan.md:86)

Notable concerns:

- `is_verified_entry` conflates payment with verification.
- `total_active_bid` defaults to ₹10 before a payment is confirmed.
- The stated reset is ₹0, while the schema and prose also refer to a ₹10 base tier.
- Money should be recorded in integer paise, not accumulated floating decimal state.
- Financial transactions should not be deleted when a listing is deleted.
- Storing both previous and new totals in payment rows risks ledger divergence.
- There is no captured time, expiry per contribution, refund, dispute, tax, currency, or gateway-event ledger.
- `portfolio_items.listing_id` couples inventory to a temporary placement.
- Price and area are display strings, making filtering and validation difficult.
- Image arrays lack ordering, captions, ownership, moderation status, and alt text.
- Locality slugs are globally unique, which will complicate multi-city expansion.
- The pool examples group several locations, but the schema stores only one locality ID.
- The property URL example uses a slug while the route specification says `portfolio_item_id`.
- There are no organization users, team roles, claim flows, audit logs, moderation states, verification evidence, or notification preferences.
- The ranking update is susceptible to concurrent-payment races unless capture processing is atomic.
- Supabase row-level security and administrative boundaries are unspecified.

RERA also should not be reduced to a boolean. The Ministry’s RERA FAQ says agents engaged in selling projects registered under the Act must register with the authority, while promoters have continuing disclosure responsibilities. Verification should retain the authority, registration number, applicable entity/project, status, verification date, and evidence—not just `true/false`. [Official RERA FAQ](https://rera.mohua.gov.in/new-img-rera/FAQs-on-RERA.pdf)

## 6. Provisional revised direction

My current recommendation is:

> RealRank should be a verified Indore real-estate directory where businesses can transparently buy sponsored visibility, while consumers browse accurate, current inventory without logging in.

### Separate the product into two layers

**Discovery layer**

- Intent and locality search
- Current property/project information
- Verified business profiles
- Availability freshness
- Call and WhatsApp actions
- Neutral relevance filters

**Sponsored rank layer**

- One entity placement per pool
- Clearly marked paid position
- Public active-bid amount
- Public ranking rules
- Rolling 30-day bid contributions
- Exact bid expiry schedule
- Bid history and ranking transparency

Payment controls visibility. It does not control verification, availability, or factual trust signals.

### Recommended ranking object

Rank the entity’s placement in:

`transaction intent × property segment × atomic locality`

For example:

`Commercial lease × Office × Vijay Nagar`

Do not rank every individual property. A placement can showcase up to three current offers relevant to that pool.

### Recommended 30-day mechanism

For every captured contribution:

- `active_from = captured_at`
- `expires_at = captured_at + 30 days`
- Active bid = sum of unexpired contributions
- Equal active bids: older qualifying position wins
- A payment below #1 still purchases the rank it qualifies for
- No temporary reservation during checkout
- If another payment captures first, the bidder receives the resulting rank, not a guaranteed obsolete position
- Show the predicted rank before payment and the confirmed rank afterward

This removes cron-based “reset everything” behavior and makes each rupee receive the promised 30 days.

### Recommended trust levels

Use explicit badges:

- Phone verified
- Business details checked
- MP RERA agent verified, when applicable
- Project RERA verified, when applicable
- Authorized seller/channel partner evidence
- Availability confirmed on a stated date

Do not use the ₹10 payment for any of these labels.

### Recommended public card

Each card should prioritize:

1. Sponsored rank and disclosure
2. Entity name and verification
3. Specialty and service area
4. Current property examples
5. Price/area range
6. Availability date
7. Call and WhatsApp CTAs
8. Active sponsored amount and “How ranking works”

The visitor’s CTA must be more prominent than the competitor’s “Outbid” action.

### Recommended MVP

Start with:

- Indore only
- Commercial leasing only
- Vijay Nagar, Super Corridor, and one central commercial locality
- 20–30 manually verified businesses
- Up to three current offers per business per placement
- Public pool pages and entity profiles
- Phone/WhatsApp onboarding
- Verification workflow
- Sponsored bidding and top-ups
- Razorpay captured-payment ledger
- Outbid and expiry notifications
- Basic click-to-call/WhatsApp analytics
- Reporting and moderation

Defer:

- Residential, PG, plots, and land
- Reviews and ratings
- Automated RERA scraping
- 1,000 programmatic pages
- Live animated reordering
- Multi-city architecture beyond sensible city keys
- Advanced project carousels
- QR awards
- Automated bidding
- Complex subscription plans
- Public rank-history charts

## 7. Questions that materially affect the final plan

Please answer these before I finalize the revised product specification:

1. Who is the primary public user at launch: companies looking for commercial space, individual property seekers, investors, or other brokers? This determines the discovery experience and what a qualified lead means.

2. Are you comfortable labeling every paid position “Sponsored rank — ordered by active bid” and avoiding unqualified claims such as “best” or “#1 real-estate agency”?

3. Should the ranked object always be an entity, or do you want developers to rank projects while brokers rank their businesses? Supporting both creates a materially different marketplace.

4. When several brokers are authorized to market the same project, should RealRank show multiple broker offers under one canonical project, or do you want exclusivity for one representative?

5. For the 30-day mechanism, do you prefer:
   - rolling 30-day contribution expiry, as recommended; or
   - a fixed 30-day campaign where all bid power expires together?

6. What is the intended purpose of ₹10: payment-pipeline validation, anti-spam, minimum bid, revenue, or verification? Would you remove the separate ₹10 fee if real verification is handled independently?

7. What verification is operationally realistic for the MVP: phone OTP only, manual business-document review, RERA lookup, project-authorization evidence, or a combination?

8. Should the public product be a useful directory even when nobody bids, with sponsored ranking layered onto it, or should the leaderboard remain the entire public experience?

9. Which single launch segment has the strongest real-world supply and buyer demand: commercial lease, plots, residential resale, residential rent, or PG/hostel?

10. Will one owner manage each business, or do agencies need multiple staff accounts, permissions, and shared notification settings in the MVP?

Once these are answered, I can turn this into a definitive revised product model, user journeys, rules matrix, MVP boundary, and architecture—still before any UI or implementation work.
