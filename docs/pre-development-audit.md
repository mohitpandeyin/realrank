# Realrank pre-development mock-screen audit

**Audit date:** 13 November 2026  
**Decision:** Ready for Next.js setup after a short preflight closure; no further broad wireframe redesign is recommended.

## Executive verdict

The Realrank product direction is mature enough to translate into a scalable Next.js application. The core public, payment, ownership, portfolio, support and internal-operations journeys are represented by working responsive wireframes, and the master product plan is unusually detailed for this stage.

The remaining risk is not a missing visual direction. It is consistency between routes, authorization, operational data and reusable component boundaries. Resolve the five **pre-setup gates** in this document, then start with one end-to-end vertical journey rather than producing more standalone mock screens.

### Readiness by area

| Area | Status | Audit conclusion |
| --- | --- | --- |
| Product model and terminology | Locked | Realrank Index, Rank total, city pools, shared entity Rank total and profile/portfolio model are consistent. |
| Public discovery and listing | Ready | The homepage, city context, stable filters, entity cards and add-city entry are sufficient implementation references. |
| Public profile and portfolio | Ready | The public profile and item detail have a clear, lean hierarchy and share the intended owner-profile structure. |
| Payment and phone onboarding | Ready | Direct checkout handoff, delayed/failed states, success, WhatsApp OTP, SMS fallback and post-verification actions are covered. |
| Owner experience | Ready | Profile, portfolio composer/editor, Index top-up, cities, Insights and Account interactions are represented. |
| Help and issue reporting | Ready at UI level | The combined contextual route and form are clear; persistence and staff workflow schema are still missing. |
| Admin operations and access | Ready at UI level | Queue, entities, payments, cities, support and team access are present; persistence, roles and audit schema are still missing. |
| Responsive and accessibility foundation | Good, not certified | Representative desktop and 375px layouts are coherent; production components still need automated viewport, keyboard and screen-reader testing. |
| Database contract | Strong core, incomplete operations | Identity, catalogue, cities, payments, ranking and portfolio are robust. Support, staff access, audit and notifications need additive contracts. |
| Next.js architecture | Direction locked | App Router, TypeScript, Server Components by default, CSS Modules, Drizzle, Supabase, Razorpay, R2 and PostHog are decided. Route and component registries remain to be written. |

## What was inspected

- 13 HTML wireframes, one shared CSS file and the dedicated Insights interaction script.
- The master product plan, pre-build decisions, research record, representative seed data and brand-kit documentation.
- Four ordered PostgreSQL migrations, development seed data, schema smoke tests and database verification script.
- Relative links, local assets, inline script syntax, semantic headings, form labelling, focus treatment, responsive CSS and representative desktop/mobile rendering.
- Public, owner, payment, support and administrator page relationships.
- Current Git state and readiness to create the application scaffold safely.

### Verification results

- PostgreSQL migrations and smoke checks pass via `scripts/verify_database.sh`.
- No broken relative page or asset references were found in the active HTML wireframes.
- Inline wireframe JavaScript parses successfully.
- Active wireframes use the `rr-` class-name convention.
- Focus-visible styles, screen-reader-only text, native labels, native dialogs and reduced-motion handling are present.
- Representative 375px checks of discovery, public profile, owner profile, payment onboarding and admin operations showed no fundamental layout failure.
- The working tree contains extensive uncommitted/staged design and schema work. It must be checkpointed before scaffolding changes are introduced.

## Screen inventory and status

### Public and transactional screens

| File | Purpose | Status | Remaining production work |
| --- | --- | --- | --- |
| `realrank-locked-terracotta.html` | Launch homepage, Indore discovery index, filters, entity entry and add-city dialog | **Final functional reference** | Replace demo data and simulated actions with server-rendered city/ranking data, canonical routes and checkout mutations. |
| `realrank-entity-profile.html` | Public entity profile and portfolio grid | **Final functional reference** | Metadata, structured data, real contact tracking, real social links and permission-safe data loading. |
| `realrank-portfolio-item.html` | Generic/project-aware portfolio detail | **Final functional reference** | Render facts by item kind, generate metadata/schema, media gallery behavior and truthful field provenance. |
| `realrank-payment-states.html` | Delayed confirmation and definitive failure | **Final functional reference** | Webhook-backed polling, order lookup, retry idempotency and recovery routing. |
| `realrank-payment-success-otp.html` | Captured-payment confirmation, phone OTP and verified handoff | **Final functional reference** | Short-lived success session, real OTP delivery, retry limits and secure entity ownership linking. |
| `realrank-owner-access.html` | Returning-owner phone login and OTP | **Final functional reference** | Supabase/provider integration, abuse controls and session creation. |
| `realrank-help-support.html` | Combined help, contextual FAQs and issue reporting | **Final functional reference** | Ticket persistence, uploads, spam protection, staff assignment and notification behavior. |
| `realrank-system-states.html` | Reusable loading, empty, error, expired and authorization states | **Component reference** | Convert to route-level and component-level `loading`, `error`, `not-found` and empty-state patterns. |

### Authenticated owner screens

| File | Purpose | Status | Remaining production work |
| --- | --- | --- | --- |
| `realrank-owner-dashboard.html` | Shared owner/public profile hierarchy, portfolio publishing, Index top-up, city management and Account sheet | **Final functional reference** | Split into reusable server-rendered sections and focused client interactions; add validation, uploads and optimistic/pending states. |
| `realrank-portfolio-insights.html` + `.js` | Minimal Search Console-style performance view and item breakdown | **Final functional reference** | Implement the event contract, bot/internal exclusions, date queries and honest empty/data-delay states. |

### Internal operations screens

| File | Purpose | Status | Remaining production work |
| --- | --- | --- | --- |
| `realrank-admin-access.html` | Staff login, work-email request, pending approval and MFA | **Final flow reference** | Auth provider integration, bootstrap administrator procedure, role guards, setup-link expiry and recovery. |
| `realrank-admin-moderation.html` | Queue, entities, payments, cities, support and team access | **Final flow reference** | Persist records and audit history, enforce action-specific permissions and connect immutable payment/ranking records. |

### Historical screen

| File | Status | Required action |
| --- | --- | --- |
| `realrank-original-index.html` | **Obsolete historical reference** | Move to an explicitly named archive/reference directory or add a prominent archival header. It uses the retired product model and non-`rr-` CSS classes and must never be treated as an implementation source. |

## Journey validation

| Journey | Coverage | Assessment |
| --- | --- | --- |
| Discover city entities → filter → open profile → contact entity | Complete | Clear and implementation-ready. Filters remain stable and ranking is visible without presenting it as quality verification. |
| New entity → enter entity/phone/amount → Razorpay → delayed/failure/success → phone verification → complete profile | Complete | The high-value conversion path is covered end to end. Razorpay owns payment-method UI, so a separate review screen is correctly omitted. |
| Existing owner → phone login → OTP channel fallback → owner profile | Complete | Reuses the same phone-verification pattern and avoids a second authentication model. |
| Owner edits identity/social links/categories | Complete at wireframe level | One editor and a maximum of three entity discovery categories are defined. Production needs server validation and contact-number reverification. |
| Owner publishes/edits portfolio → public grid → item detail | Complete at wireframe level | The simple composer and optional structured details balance publishing ease with searchable data. Upload progress/failure is not yet represented. |
| Owner adds Rank total → payment → updated positions | Complete conceptually | The inline amount control and target cue are locked. Server-side quote expiry, competitor changes and idempotency are documented but must be enforced. |
| Owner manages up to three included cities | Complete conceptually | City slots and reassignment rules are represented. Paid fourth-city pricing/checkout is intentionally not final. |
| User gets help or reports an issue → administrator resolves it | UI complete, data incomplete | Entry, contextual fields, support reference and staff actions exist. Ticket/message/attachment/resolution tables do not. |
| Staff requests access → administrator assigns role → MFA login | UI complete, data incomplete | Least privilege and bootstrap rules are documented. Staff/access/audit tables do not. |
| Second city opens → root changes from Indore index to city chooser | Product rule complete, screen absent | The routing transition is well documented but the chooser template and atomic deployment switch are not yet represented. This need not delay the Indore build, but the route architecture must support it. |
| Opt in to outbid/payment/publication notifications | Requirements only | Events are defined, but preference capture, channel selection, delivery history and unsubscribe behavior have no UI/data contract. |

## Navigation and route audit

### Navigation that is ready

- Home is the public discovery page; it intentionally has a non-sticky marketing header.
- Every non-home customer screen uses a sticky, borderless header with contextual Help access.
- The owner navigation is consistently **Home · Profile · Position · Insights · Account**. Profile is one continuous page; Position anchors to the inline Realrank Index rather than opening a duplicate page.
- Public profile and portfolio pages return to the index and retain contextual report links.
- Internal navigation is work-based: **Queue · Entities · Payments · Cities · Support**, with **Team access** separated for administrators.
- Customer owners stay within Entity records; there is no redundant generic customer-users screen.

### Route conflict to resolve before setup

The current product decision uses one canonical `/help` page and `/help?intent=report`, but the launch route block in `realrank_master_product_plan.md` still lists separate `/faq` and `/contact` pages. Lock the following policy in one route registry:

- Canonical: `/help`
- Contextual report entry: `/help?intent=report`
- Permanent redirect: `/faq` → `/help`
- Permanent redirect: `/contact` → `/help?intent=report`
- Keep `/ranking-policy` separate and authoritative.

### Route/page templates that are not visually represented

- `/{city}/category/{category-slug}`: should reuse the discovery/index template with unique metadata, introduction, breadcrumb and selected category state.
- `/how-it-works`, `/ranking-policy`, `/terms`, `/privacy` and `/refund-policy`: need a shared simple content-page shell and final copy, not unique visual designs.
- Root live-city chooser after city two launches: needs a minimal template before self-service second-city activation is enabled.
- App Router `not-found` and route/global error boundaries: adapt the existing system-state language.
- Owner/admin route names and guards are documented conceptually but do not yet exist as a single route/access matrix.

## UI and design-system audit

### Strengths

- The official Realrank logo, spelling, favicon set and terracotta/charcoal visual direction are consistently applied.
- Public and signed-in profiles intentionally share the same identity, Index and portfolio hierarchy.
- Visual hierarchy is restrained: Contact is primary publicly; editing, website and management utilities are quiet outlined actions.
- The portfolio uses a scalable three-column desktop/two-column mobile grid with minimal card information.
- Shared CSS already exposes core colour tokens and reusable primitives for containers, buttons, forms, cards, badges, dialogs, status views and navigation.
- Mobile gutters, fixed owner navigation, safe-area padding, horizontally scrollable Index data and conditional form layouts are defined.

### Design-system work required for production

1. **Expand tokens.** The current CSS defines colours and one shadow, but spacing, typography, radii, control heights, breakpoints, layers and motion still use repeated literal values. Convert these into a small typed token set before copying styles into CSS Modules.
2. **Correct the small-text accent rule.** Terracotta `#C4512D` on the page background is approximately 4.37:1, just below WCAG AA for normal text. Keep it for large text, borders and icons; use `--rr-accent-dark` for small textual links/labels.
3. **Create shared primitives.** Header, Help menu, button variants, fields, phone input, amount stepper, modal/drawer, status panel, portfolio card, entity card, bottom navigation, toast and empty/error components should not be copied between pages.
4. **Avoid importing the monolithic wireframe CSS unchanged.** Treat `realrank-flow.css` as the visual contract, then split production styles by shared primitive and feature.
5. **Use one icon component set.** Replace duplicated inline SVG markup with Lucide/shared icons while preserving accessible names.
6. **Render only the active state in production.** Some wireframes contain multiple hidden `h1` elements for prototype state switching; the application route/state should expose one active page heading.

## Responsive, accessibility and usability audit

### Validated

- Discovery, public profile, owner profile, payment onboarding and admin queue remain usable in a representative 375px viewport.
- Public and owner portfolio grids retain two columns on mobile as intended.
- Form controls generally meet the intended 44px touch target; owner bottom navigation includes safe-area clearance.
- Visible keyboard focus, native labels/wrapped labels, accessible icon labels, live regions and native dialog semantics are present.
- The reduced-motion rule disables skeleton animation.

### Still required in production

- Automated visual/overflow checks at 320, 375, 768, 1024 and wide desktop widths.
- Keyboard-only runs for every dialog, dropdown, stepper, filter and OTP flow, including focus return after closing.
- Screen-reader testing of the Help dropdown, rank/amount announcements, OTP errors, charts and dynamic success states.
- Automated axe checks plus a token-level contrast test.
- Long-name, large-amount, missing-logo, zero-image, slow-image and translated-text fixtures.
- Ensure the fixed owner navigation never covers the final action or validation error after viewport/keyboard changes.
- Treat admin as desktop/tablet-first for MVP. Its phone layout is functional but dense and should not consume public-launch polish unless mobile staff usage is a real requirement.

## Data and architecture audit

### Strong existing database foundation

The current migrations correctly separate:

- owner identity, entities, social links and canonical city/catalogue data;
- pending checkouts, captured payments, immutable allocations, city slots/listings and append-only Rank contributions;
- generic portfolio items, cities, media and optional project/auction/taxonomy extensions;
- cross-table validation, ranking views, indexes, append-only protections and secure-by-default row-level security.

The database verification script passes. This contract is suitable for the first public vertical journey and should remain authoritative over browser state and analytics.

### Missing operational contracts

Add additive schema contracts before building their application features:

1. **Support:** tickets, messages/replies, attachments, status, assignment, resolution note, originating route/entity/order context and timestamps.
2. **Staff access:** staff profile, access request, role/permissions, status, MFA/setup state and bootstrap provenance. Supabase Auth may own credentials, but Realrank still needs application authorization records.
3. **Audit:** immutable actor/action/target/reason metadata for moderation, role, access, phone, city, refund/reversal and high-risk changes.
4. **Notifications:** channel preferences and consent, watched position/target, delivery attempts, rate limiting and unsubscribe state. Do not infer marketing consent from OTP use.

### Other architectural decisions to make before their feature starts

- Select the production WhatsApp/SMS OTP provider or define a provider interface and local adapter so authentication is not coupled to one vendor.
- Define the exact owner/admin session claims and authorization checks; never rely on hidden UI for access control.
- Define R2 upload metadata, signed-upload lifecycle, size/count limits, image transformation and cleanup for abandoned uploads.
- Define PostHog event names and metric semantics in code before Insights is implemented. PostgreSQL and payment ledgers remain authoritative.
- Define slug collision/retirement behavior and redirect history for entities, portfolio items and cities.
- Keep second-city root switching behind an explicit deployment/feature flag with canonical and sitemap updates in the same release.

## Missing screens or states

### Needed before the related feature can ship

- Shared legal/policy content shell and actual Ranking Policy, Terms, Privacy and Refund Policy copy.
- Category/city discovery route template.
- Owner phone-change verification and lost-number recovery outcome. The existing OTP components can be reused; a new visual system is unnecessary.
- Media upload progress, failure, retry and removal states inside the portfolio composer.
- Admin setup-link expired, password/MFA setup and MFA recovery behavior, unless entirely provider-hosted.
- Route-level 404, authorization failure and unexpected error states using the existing system-state components.

### Explicitly not missing

- A payment review page: the validated action and Razorpay handoff are sufficient.
- Separate Help and Report pages: the combined contextual page is correct.
- A separate owner Position page: the inline section and navigation anchor are correct.
- Separate Project URLs or a second project publishing system: portfolio item kinds and one canonical detail route are sufficient.
- A generic customer Users admin page: owners belong to Entity records.
- A chart-heavy admin dashboard: the work queue is the correct landing view.

## Prioritised remaining work

### 1. Must have before Next.js setup

1. **Checkpoint the current repository state.** Review and commit the accumulated wireframe, documentation and schema work before scaffolding so the design baseline is recoverable.
2. **Lock one canonical route registry and access matrix.** Resolve `/help` versus `/faq`/`contact`; name public, owner and admin routes; define redirects, route groups and required roles; include the single-city-to-multi-city transition.
3. **Create a production component/state inventory.** Define shared components, which are Server Components, the few that require client state, and the source of truth for each action. Do not recreate each HTML page independently.
4. **Lock production design tokens.** Add spacing/type/radius/layer/motion tokens, adopt the small-text contrast rule and mark `realrank-original-index.html` as historical.
5. **Write additive operational-schema stubs.** At minimum define ownership and relationships for staff access, support tickets, immutable audit events and notification consent, even if individual features are built later.

These are planning/contracts, not Next.js implementation. Completing them should be a short preflight, not another redesign cycle.

### 2. Can be finalised during development

- Build the shared legal/content-page shell and write final policy copy before enabling real payments.
- Implement the city/category page using the discovery components rather than designing a second index.
- Add media upload/retry/removal behavior and image optimization.
- Implement account phone change, recovery escalation and admin setup/MFA expiry using shared verification/status components.
- Add notification preference UI before outbid alerts are enabled.
- Add automated accessibility, responsive, visual-regression and end-to-end tests as each vertical slice is built.
- Refine admin mobile density only if operational users need phone-based moderation.
- Add final SEO metadata, JSON-LD, sitemap, pagination and `noindex` thresholds alongside real server data.

### 3. Future enhancements that must not delay setup

- Visitor accounts, Follow/Subscribe and public notification controls.
- Business, identity, RERA or property verification beyond precise phone-control status.
- Recovery email and Google identity connection after MVP phone onboarding.
- Canonical cross-entity project deduplication and developer/project graph.
- Advanced attribution, cohort analytics, benchmarks and multiple complex charts.
- Hindi/local-language routes.
- More than three included cities and a polished paid extra-city purchase flow.
- Rich media, video, map exploration, saved searches and personalized recommendations.
- Advanced admin analytics or a separate audit-log explorer.

## Recommended next sequence

1. Complete the five pre-setup gates above.
2. Scaffold the Next.js application without changing product scope.
3. Establish tokens, font, icons, route groups, shared header/footer/navigation and test tooling.
4. Implement one vertical journey: **Indore discovery → entity entry → Razorpay test checkout → webhook fulfilment → phone OTP → owner profile → public profile**.
5. Add portfolio publishing/detail and media upload.
6. Add owner Index top-up, cities and Insights.
7. Add Help/Support persistence and then internal operations/admin access.
8. Add production policy content, SEO/indexation and launch hardening.

## Final recommendation

Stop adding broad mock-screen variations. The active wireframes are sufficiently mature to serve as functional references. The correct next move is a brief architecture preflight followed by component-led implementation, with the database and server actions—not prototype JavaScript—owning payment, ranking, identity, authorization and publication state.
