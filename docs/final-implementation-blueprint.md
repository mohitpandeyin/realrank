# Realrank final implementation blueprint

**Prepared:** 13 November 2026  
**Status:** Approved implementation contract; Milestone 0 in progress.

## 1. Readiness decision

Realrank is ready to begin Next.js setup after this blueprint is approved. The visual direction, primary journeys, product terminology, core stack and transactional data model are sufficiently mature. The remaining work should be handled incrementally inside the implementation milestones rather than by creating more broad wireframes.

The existing repository is clean and checkpointed at commit `ae285c7` (`feat: before development reviewed`). Existing wireframes, product documents and migrations `0001–0004` remain unchanged and authoritative historical inputs.

### Source-of-truth precedence

When current files disagree, use this order:

1. this approved implementation blueprint;
2. the latest locked decisions in `docs/before-start.md` and active wireframes;
3. `realrank_master_product_plan.md`;
4. `docs/first-research.md`, which is historical research rather than an implementation specification.

## 2. Pre-setup gates: genuine blockers versus incremental work

| Audit gate | Before scaffolding? | Decision |
| --- | --- | --- |
| Checkpoint the current repository | **Completed** | Worktree is clean and the pre-development audit is committed. |
| Canonical routes and authorization matrix | **Yes** | Finalized in sections 5 and 6 of this blueprint. |
| Component/state and Server/Client boundaries | **Yes** | Finalized in sections 7 and 8. Do not create page-specific copies of shared UI. |
| Core design tokens | **Yes, as a contract** | Finalized in section 9. Actual CSS Modules are created during setup. |
| Operational schema stubs | **No physical migration before scaffolding** | Required relationships and security fixes are identified in section 10. Add them through new migrations during the relevant milestone; do not rewrite `0001–0004`. |

### Mandatory before the scaffold command

Only these actions remain:

1. approve this blueprint;
2. confirm the package manager, with **pnpm recommended**;
3. create a new implementation branch from the clean checkpoint.

The OTP provider, operational tables, legal content and production infrastructure do not block creation of the Next.js skeleton. They must be resolved before their corresponding milestone or before real payments are enabled.

## 3. Decisions already locked

- Official product spelling is **Realrank**; lowercase `realrank` is used for routes, packages and database identifiers.
- Realrank is a city-based discovery index. There is no state-wide or All India ranking pool.
- `/` serves Indore during the one-city phase. Entity URLs remain city-independent.
- An entity has one permanent, cumulative Rank total shared across all active cities and eligible category views.
- Ranking is determined by Rank total and deterministic tie-breaking. It is not a quality score, rating, recommendation or verification.
- Rank Amount is the payment control; Rank total is the cumulative public amount.
- Entity categories are global to the entity, limited to three and independent of city slots.
- Portfolio items retain their own primary category, property type, purpose and applicable cities.
- The owner profile and public profile use the same structural components; editing controls are added only in owner context.
- Owner navigation is exactly **Home, Profile, Position, Insights, Account**. Position anchors to the inline section titled **Realrank Index**.
- Help and issue reporting use one combined contextual Help & Support experience.
- Razorpay Checkout opens directly from a freshly validated action. There is no separate payment-review page.
- A verified captured-payment webhook—not a browser callback—authorizes publication, Rank credit or a paid city slot.
- Account ownership is established by a short-lived payment-success session plus successful phone OTP. Payment details or a matching phone alone do not prove ownership.
- WhatsApp is the preferred OTP delivery experience and SMS is the visible fallback. A verified phone proves control of that number only.
- PostgreSQL is authoritative for identity links, publication, payments, Rank, city capacity and moderation. R2 and PostHog never become transactional sources of truth.
- Public content is server-rendered by default. Client Components are limited to genuine browser interaction.
- The MVP is a modular monolith: one Next.js application, one PostgreSQL database, one payment integration and no separate search service.

## 4. Decisions still requiring confirmation

These do not block scaffolding unless noted.

| Decision | Recommendation | Needed by |
| --- | --- | --- |
| Package manager | **pnpm** with a committed lockfile | Before scaffolding |
| OTP/Auth delivery | Run a short provider spike. Keep Supabase Auth for identity/session only if the selected provider genuinely supports the locked WhatsApp-primary/SMS-fallback flow. Otherwise use a small `OtpProvider` adapter and link the verified result to Supabase Auth. | Before authentication milestone |
| Portfolio image source limit | **10 MB per source image**, maximum ten images; transform before publication | Before media upload implementation |
| Additional-city slot price | Keep configurable in PostgreSQL/server configuration; do not hard-code in UI | Before selling a fourth slot |
| Outbid notification channel and quiet hours | Explicit opt-in; start with one selected channel and rate limiting | Before enabling outbid alerts |
| Error monitoring vendor | Use **Sentry** unless there is a cost/compliance reason to choose an equivalent | Before public payment testing |
| GST/invoice treatment | Confirm with an Indian accountant | Before real payments |

## 5. Canonical route registry

Route groups organize code and layouts but do not change public URLs.

### Public routes

| Route | Purpose | Access/indexing |
| --- | --- | --- |
| `/` | Indore discovery page while only one city is live; live-city chooser after city two opens | Public, indexable |
| `/indore/category/[categorySlug]` | Launch city category index | Public, indexable when supply threshold is met |
| `/[city]` | City index after more than one city is live | Public, indexable subject to city threshold |
| `/[city]/category/[categorySlug]` | City/category discovery | Public, indexable only with useful unique content |
| `/entity/[entitySlug]` | Canonical public entity profile | Public; index based on publication/moderation quality |
| `/entity/[entitySlug]/portfolio/[itemSlug]` | Canonical portfolio item for every item kind | Public; thin/unclassified items use `noindex` |
| `/help` | Help, FAQs and issue reporting | Public; context changes content but not route family |
| `/how-it-works` | Concise product explanation | Public, indexable |
| `/ranking-policy` | Authoritative ranking and disclosure policy | Public, indexable |
| `/terms`, `/privacy`, `/refund-policy` | Legal content | Public, indexable |

### Transaction and owner routes

| Route | Purpose | Access/indexing |
| --- | --- | --- |
| `/access` | Returning-owner phone access and OTP | Anonymous-only entry; `noindex` |
| `/payment/status` | Pending, failed or fulfilled payment state | Requires an opaque HttpOnly checkout-status session; `noindex` |
| `/onboarding` | Payment-success phone verification and ownership linking | Requires an unexpired onboarding session; `noindex` |
| `/manage` | Continuous owner profile: identity, portfolio, Realrank Index and cities | Authenticated owner; `noindex` |
| `/manage/insights` | Owner performance view | Authenticated owner; `noindex` |

Owner panels may use non-canonical search parameters such as `?panel=account`, `?edit=profile` or `?new=portfolio`. They are view state, must be ignored by canonical metadata and must not weaken server authorization. Position links to `/manage#realrank-index`.

### Admin routes

| Route | Purpose | Access |
| --- | --- | --- |
| `/admin/access` | Staff login, access request and MFA | Anonymous/pending/active staff states |
| `/admin` | Review queue | Reviewer, Finance or Administrator as permitted by item type |
| `/admin/entities`, `/admin/entities/[id]` | Entity and ownership records | Reviewer/Administrator; Finance read-only when payment context requires it |
| `/admin/payments`, `/admin/payments/[id]` | Payment reconciliation and reversals | Finance/Administrator |
| `/admin/cities`, `/admin/cities/[id]` | Catalogue and publication status | Reviewer/Administrator |
| `/admin/support`, `/admin/support/[id]` | Support cases and replies | Reviewer/Administrator; Finance for payment cases |
| `/admin/team`, `/admin/team/[id]` | Staff access and role management | Administrator only |

### External route handlers

- `/api/webhooks/razorpay` — signed gateway webhook only.
- `/api/uploads/sign` — authenticated, ownership-checked presigned upload creation.
- `/api/analytics/capture` — allowlisted privacy-safe public events only.
- `/api/health` — minimal deployment health; no secrets or database details.

Normal same-origin forms should use Server Actions. Do not create API routes merely to mirror every form.

### Redirect and canonical rules

- `/faq` → `/help` with a permanent `308`.
- `/contact` → `/help?intent=report` with a permanent `308`.
- During the one-city phase, `/indore` → `/` with a permanent `308`; `/` is self-canonical.
- When the second city becomes live, `/` becomes the chooser and `/indore` becomes self-canonical in the same cache/sitemap update.
- Lowercase URLs and no trailing slash are canonical. Normalize case/trailing slashes with permanent redirects.
- Retired entity/item/city slugs redirect through explicit slug-history records, never through fuzzy guessing.
- Unknown cities, categories and slugs return `404`; do not silently redirect to the homepage.
- Transient filters and sorting remain query parameters, use `noindex` where appropriate and canonicalize to the stable city/category page.
- Reserve `entity`, `help`, `admin`, `manage`, `access`, `payment`, `onboarding`, `terms`, `privacy`, `refund-policy`, `ranking-policy`, `how-it-works` and `api` from city slugs.

## 6. Authorization matrix

Every Server Action, route handler and data query rechecks authorization. Middleware may improve routing but is never the security boundary.

| Actor | Public data | Own entity/portfolio/cities | Payments/Rank | Moderation/support | Staff access |
| --- | --- | --- | --- | --- | --- |
| Anonymous | Approved public views only | Start pending checkout; no management | View status only through opaque session | Submit public issue | None |
| Owner | Public data plus own private records | Read/write entities where `owner_account_id` matches; manage active city slots and portfolio | Create top-up/city-slot checkout; read own payment status; never write ledger | Read/reply to own support cases | None |
| Reviewer | Public plus moderation evidence | Review entity/content/city records | Read payment context only; no refund or ledger mutation | Review, reply, escalate and resolve non-financial cases | View own staff profile only |
| Finance | Public plus necessary payment/entity context | Read-only context | Reconcile payments and create policy-authorized refund/reversal requests | Handle payment cases | None |
| Administrator | All operational records | Moderation and access recovery with reason | Finance capabilities; still no direct Rank-total editor | All cases | Approve/disable staff and assign roles |
| System worker | No interactive UI | Fulfil verified events | Webhook processing, allocations, contributions, reversals and notification jobs | Automated records only | None |

Additional rules:

- Pending staff receive no operational session.
- All privileged staff require MFA.
- No staff role may directly type a Rank total or city position.
- One entity has one owner account in MVP; one owner account may technically own multiple entities, although the initial UI is scoped to one active entity.
- Ownership transfer, phone change, role change, refund, reversal, suspension and city reassignment require immutable audit records.

## 7. Recommended project structure

```text
src/
  app/
    (public)/
      page.tsx
      [city]/
        page.tsx
        category/[categorySlug]/page.tsx
      entity/[entitySlug]/
        page.tsx
        portfolio/[itemSlug]/page.tsx
      help/page.tsx
      how-it-works/page.tsx
      ranking-policy/page.tsx
      terms/page.tsx
      privacy/page.tsx
      refund-policy/page.tsx
    (transaction)/
      access/page.tsx
      payment/status/page.tsx
      onboarding/page.tsx
    (owner)/
      manage/page.tsx
      manage/insights/page.tsx
    (admin)/
      admin/
        access/page.tsx
        (protected)/
          page.tsx
          entities/page.tsx
          entities/[id]/page.tsx
          payments/page.tsx
          payments/[id]/page.tsx
          cities/page.tsx
          cities/[id]/page.tsx
          support/page.tsx
          support/[id]/page.tsx
          team/page.tsx
          team/[id]/page.tsx
    api/
      webhooks/razorpay/route.ts
      uploads/sign/route.ts
      analytics/capture/route.ts
      health/route.ts
  components/
    ui/
    brand/
    navigation/
  features/
    discovery/
    entities/
    portfolio/
    ranking/
    payments/
    auth/
    support/
    insights/
    admin/
  server/
    auth/
    db/
      schema/
      queries/
      transactions/
    payments/
    storage/
    analytics/
    security/
  styles/
    tokens.css
    globals.css
  env.ts
db/
  migrations/
  seeds/
  tests/
tests/
  unit/
  integration/
  e2e/
public/
  brand/
```

Guidelines:

- Keep existing root `db/` as the migration contract. Drizzle schema code maps to it; do not create a competing migration history.
- Keep feature-specific components, Zod schemas, Server Actions and queries together under `features/` until something is genuinely shared.
- `components/ui` contains only small product primitives, not a generic UI framework.
- `server/` must never be imported by Client Components. Enforce this with `server-only` imports and lint rules.
- Avoid repository-wide barrel files and speculative service interfaces. Add an adapter only at real vendor boundaries: payments, OTP, storage and analytics.

## 8. Reusable component, state and data-ownership inventory

### Server Components by default

- `PublicHeader`, `OwnerHeader`, `AdminHeader`, `Footer`, page/container shells.
- `CityIndex`, `EntityList`, `EntityCard`, ranking disclosure and pagination.
- `ProfileIdentity`, verification mark, category line, social links and `IndexStrip`.
- `PortfolioGrid`, `PortfolioCard`, portfolio-detail facts and related items.
- Owner profile read view, current city positions and Rank total display.
- Insights metric summary and listing-performance table.
- Admin lists, record evidence and audit-history rendering.
- Legal/policy content shell and reusable loading/empty/error states.

### Client Components only where interaction requires them

- `HelpMenu`, city picker/search, More-filter sheet and mobile dialogs.
- `ListingEntryForm`, `AmountInput` and `AmountStepper`.
- `RazorpayLauncher`, payment-status poller and copy-order control.
- `PhoneOtpForm` with channel fallback, resend countdown and verification state.
- Profile editor, social-link rows, city manager and Account sheet.
- Portfolio composer, conditional details, media uploader/reorder and upload progress.
- Rank top-up control and target cue.
- Insights metric selector, date selector and interactive trend chart.
- Admin review/action dialog where inline confirmation is necessary.
- Toast/live-region announcer.

Prefer progressively enhanced forms backed by Server Actions. A component being inside a dialog does not automatically require all of its data and validation to live on the client.

### State ownership

| Data/state | Owner |
| --- | --- |
| Entities, cities, category assignments, portfolio metadata, publication and moderation | PostgreSQL |
| Pending quotes, payment allocations, refunds and Rank contributions | PostgreSQL; Razorpay is external payment evidence |
| Authentication identity/session | Supabase Auth or the approved identity provider |
| OTP delivery challenge | Approved OTP provider through `OtpProvider`; Realrank stores only safe challenge/session metadata |
| Uploaded bytes | Cloudflare R2; ownership, dimensions, moderation and ordering stay in PostgreSQL |
| Product events and owner Insights | PostHog through a server-controlled event/query boundary |
| Selected filters, pagination and date range | URL/search parameters where shareable; local state only while editing |
| Open menu/dialog, input draft and upload progress | Client component memory |
| Derived public rankings | PostgreSQL views/queries; caches may accelerate but never author them |

### Standard async states

Do not invent a universal state machine abstraction. Each mutation supports the same understandable phases:

- idle;
- client validation error;
- server validating/submitting;
- external pending where relevant (payment/OTP/upload);
- success with authoritative refreshed data;
- recoverable error preserving user input; and
- terminal/unavailable state with one useful next action.

## 9. Minimal production design tokens

Do not convert every wireframe literal into a token. Lock only repeated foundations.

### Colour roles

```css
--rr-color-page: #faf9f6;
--rr-color-surface: #ffffff;
--rr-color-text: #20201e;
--rr-color-muted: #6e6a65;
--rr-color-line: #dddad5;
--rr-color-action: #c4512d;
--rr-color-action-strong: #a54122;
--rr-color-action-tint: #f7e3dc;
--rr-color-quiet: #efede9;
--rr-color-success: #256b4a;
--rr-color-success-bg: #e9f4ee;
--rr-color-warning: #966116;
--rr-color-warning-bg: #fff4de;
--rr-color-danger: #a43f32;
--rr-color-danger-bg: #fae9e5;
```

The logo's brand terracotta remains `#C65D2E` inside the supplied asset. It is not the normal UI button colour: white text on it does not meet normal-text AA contrast. Keep `#C4512D` for primary UI fills and `#A54122` for small terracotta text on light surfaces.

### Remaining foundations

- Font: Inter/system sans for product UI. The brand asset controls its own wordmark typography.
- Type steps: 11, 12, 14, 18, 22 and fluid page/display headings. Avoid production text below 11px.
- Spacing steps: 4, 8, 12, 16, 24, 32, 44 and 64px.
- Radii: 10, 14, 18, 22px and pill.
- Minimum interactive target: 44px; compact visual icons may be smaller only inside a 44px hit area.
- Containers: 1120px standard, 760px narrow, 20px desktop gutter and 14px mobile gutter.
- Breakpoints: 680px and 900px, matching the functional wireframes.
- Layers: base, sticky content, navigation/floating action, overlay and toast. Components must use layer tokens rather than arbitrary z-index escalation.
- Motion: 160–220ms restrained transitions; disable non-essential animation under `prefers-reduced-motion`.
- Shadow: retain one soft elevation token; use borders/whitespace for most grouping.

Logo CSS is `height: 47px; width: auto` on standard screens, with the agreed narrow-screen height where required. Intrinsic image dimensions reserve aspect ratio, but CSS must not force both width and height.

## 10. Database and security review

### Preserve unchanged

Migrations `0001–0004` correctly establish identity/catalogue, payments/coverage/Rank ledgers, portfolio/project extensions, validation, public ranking views, indexes and deny-by-default RLS. The smoke suite currently passes. Do not edit or squash them.

Migration `0002` already persists webhook events in `gateway_webhook_events` and enforces unique `(gateway, gateway_event_id)`. Preserve that contract and use it as the first idempotency gate during fulfilment; do not duplicate the table or constraint in a later migration.

### Additive migration required before the payment vertical slice

Create a new migration, provisionally `0005_payment_ownership_and_security.sql`, to address:

1. **Rank-total concurrency:** replace the trigger's read-sum-write cache refresh with an atomic entity-row update or equivalent serialized function. Two simultaneous contributions for the same entity must never overwrite one another.
2. **One paid allocation → one Rank contribution:** add a partial unique index on `ranking_contributions(payment_line_item_id)` for `source = 'PAYMENT'`.
3. **Allocation uniqueness:** enforce the intended one line item per `(payment_id, purpose)` for the current two-purpose checkout model, while retaining deterministic `allocation_reference`.
4. **Checkout lifecycle:** enforce valid pending-checkout transitions and idempotent fulfilment.
5. **Payment-success onboarding sessions:** add a short-lived, single-use session linked to payment, entity, normalized phone, expiry and consumption time. Store only a hash of any bearer token.
6. **Phone-verification invariant:** changing an owner or public contact number must invalidate its previous verification timestamp unless a new completed verification is supplied in the same trusted transaction. Per-city contact overrides need equivalent verification metadata or must be limited to an already verified number.
7. **Public view allowlist:** replace `public_portfolio_items SELECT pi.*` with explicitly public columns; never expose legacy keys, moderation internals or private operational fields by accident.
8. **Canonical city uniqueness:** add normalized/case-insensitive uniqueness that treats a missing district consistently; the current nullable composite unique constraint can admit duplicates.
9. **Discovery-category concurrency:** serialize the maximum-three check so concurrent inserts cannot create a fourth category.

### Add before portfolio publishing

- Enforce in the transaction/service layer—and preferably through a deferred database check—that a published portfolio item has exactly one primary active entity city.
- Keep media metadata in PostgreSQL and add upload lifecycle metadata only if needed for abandoned-upload cleanup.
- Keep classification optional, but exclude incomplete records from dependent filters exactly as documented.

### Add before support/admin features

Use small additive tables; do not create a generic customer Users table.

- `support_tickets`, `support_messages`, `support_attachments`;
- `staff_accounts`, `staff_access_requests` with one role/status per MVP staff account;
- immutable `audit_events` with actor, action, target, reason and timestamp;
- later, `notification_preferences` and `notification_deliveries` before outbid alerts are enabled.

### RLS and credential policy

- RLS is enabled but no policies currently exist, so direct anon/authenticated table access is denied. Keep that secure default.
- Browser code must not query application tables directly in MVP. All reads/writes pass through authorized Next.js server code.
- Never expose `DATABASE_URL`, Supabase service-role credentials, Razorpay secrets, PostHog personal keys or R2 secrets to the browser.
- Use a restricted server database role for normal application operations and a separately scoped worker/fulfilment credential before real payments. The worker alone may execute financial fulfilment functions.
- If direct Supabase data access is introduced later, write and test explicit owner-scoped policies first; do not assume the authentication session automatically creates authorization.
- Audit and ledger records are append-only. Production corrections are compensating records, not edits or deletes.

## 11. Critical business rules

### Ranking and concurrency

- Rank contributions are integer whole rupees, stored in paise, with a ₹10 minimum. Free-form input may be any whole-rupee amount; `+ / −` moves to adjacent ₹10 values.
- To quote a target position, use a fresh server transaction and current eligible competitor totals. A first-place suggestion is at least `max(₹10, competitor total + ₹1 − entity total)`.
- A quote expires quickly and is never a reservation. Revalidate immediately before creating the Razorpay Order.
- Captured contributions update the shared entity total atomically. Every city/category position is derived after commit using total descending, effective eligibility/tie timestamp ascending, then stable ID.
- All ranking timestamps are PostgreSQL `timestamptz` values assigned inside the authoritative database transaction. `ranking_contributions.created_at`, `city_listings.activated_at` and `entity_discovery_filters.selected_at` must use the database clock; never accept a browser timestamp or HTTP arrival time for ordering. `entities.shared_total_reached_at` is set from the committed contribution timestamp. City ranking uses `GREATEST(shared_total_reached_at, activated_at)`, filter ranking additionally includes `selected_at`, and the final deterministic key is the stable city-listing UUID ascending.
- Simultaneous buyers may change the resulting position. The user always receives the purchased Rank contribution, never a guaranteed position.
- A refund/chargeback inserts an exact negative reversal linked to the original contribution. No ledger row is mutated.
- Paid city-slot fees never enter Rank total.

### Razorpay and webhook idempotency

1. Validate raw-body signature before trusting the payload.
2. Insert the gateway event under unique `(gateway, gateway_event_id)`. A duplicate returns success without repeating fulfilment.
3. Lock the internal payment/order row and validate gateway order, payment, currency and captured amount.
4. Apply only monotonic valid status transitions. Reconcile unexpected/out-of-order events against Razorpay before changing state.
5. Create deterministic immutable allocation references.
6. In one database transaction, create allocations, Rank contribution/city entitlement, publication state and processed timestamp.
7. Commit before invalidating page caches or sending notifications.
8. Browser success callbacks may improve UX but never fulfil value.
9. Delayed-status polling reads the internal payment state and warns against paying again.

### OTP security

- Six-digit, single-use challenge with a five-minute lifetime.
- Starting limits: one send per 30 seconds, five sends per phone per hour, and five verification attempts per challenge. Keep limits configurable and combine phone, IP and provider abuse signals.
- Changing WhatsApp/SMS channel creates a new challenge and invalidates the previous code.
- Use Turnstile and generic responses that do not reveal whether an account exists.
- If provider-managed, store only provider challenge ID/status metadata; if self-managed, store a strong code hash, never the plaintext code.
- Never log OTPs, full phone numbers or authentication payloads. Mask phone numbers in UI and logs.
- Successful verification rotates the session, records the verified E.164 number and consumes the onboarding/verification session atomically.
- OTP consent is authentication consent only and cannot be reused as outbid/marketing notification consent.

### Ownership verification

- A payment, entity-name match, gateway phone or public contact number alone never establishes ownership.
- New ownership requires an unexpired payment-success session bound to the captured payment/entity/phone plus successful OTP for that phone.
- Matching entity name and verified owner phone may open a top-up flow. A different phone creates a review case and no management access.
- Public contact phone and private owner login phone remain separate fields even if initially equal.
- One entity has one owner in MVP. Ownership recovery/transfer is administrator-mediated, reasoned and audited.

### Media uploads

- Maximum ten images per portfolio item; JPEG, PNG and WebP only.
- The source-size limit remains milestone configuration rather than a Foundation dependency. Start the media milestone with a proposed 10 MB default per image, validate it against transformation cost and provider limits, then expose it through server configuration and shared validation rather than hard-coding it across components.
- Issue short-lived presigned uploads only after owner/entity authorization. Use unpredictable object keys and never expose R2 credentials.
- Validate magic bytes, dimensions and size after upload; strip EXIF/location metadata; generate approved display variants; preserve aspect ratio.
- Upload to a private/pending namespace. Only approved metadata/object variants are published through the delivery domain.
- Preserve successful uploads when another file fails. Delete unattached temporary objects through a scheduled cleanup.
- PostgreSQL owns ordering, cover role, alt text, dimensions, MIME type and moderation status.

### Analytics event contract

Use snake_case event names and a required integer `schema_version`.

| Event | Definition/source |
| --- | --- |
| `category_selected` | User selects a stable category/refinement; browser |
| `entity_profile_viewed` | Successful public profile render; deduplicated once per anonymous session/30 minutes |
| `portfolio_card_viewed` | At least 50% visible continuously for one second |
| `portfolio_item_viewed` | Successful public item render; deduplicated once per session/30 minutes |
| `contact_clicked` | Contact action activated; profile/item and method recorded; rapid duplicates suppressed |
| `portfolio_item_shared` | Share action completed or copy action succeeds |
| `claim_clicked` | Claim action selected with city/filter context; no quoted amount sent to analytics |
| `listing_started` | First meaningful interaction with new-entity form |
| `checkout_started` | Server accepted a fresh quote and created an order |
| `payment_captured` | Verified server webhook only; no payment/order ID or amount in PostHog |
| `phone_otp_completed` | Verified server result only; no phone/channel identifier beyond controlled channel value |
| `profile_completed` | Required profile completion transaction succeeds |

Allowed properties are stable internal entity/item/city/filter IDs, controlled placement/source/contact-method values and schema version. Never send names, phone/email, descriptions, full URLs with tokens, order/payment IDs, support text or gateway data. Exclude owner previews, staff/test traffic and obvious bots. Keep session replay off at launch. Insights queries are authorized server-side named queries with caching; analytics outages cannot affect core flows.

## 12. Development workflow

### Environments and configuration

- Environments: local, preview/test and production. Use Razorpay Test Mode, test OTP adapter and non-production R2/PostHog projects outside production.
- Commit `.env.example` with names and descriptions only. Validate all environment variables at startup with Zod.
- Groups: app URL/environment; PostgreSQL/Supabase; Razorpay; OTP provider; R2; Turnstile; PostHog; Sentry.
- Only deliberately public identifiers use `NEXT_PUBLIC_`. Secrets are server-only and must never be imported by Client Components.
- Select the supported stable Next.js release and stable Node LTS at scaffold time; record Node in `.nvmrc` or `.tool-versions` and pin package manager/version in `package.json`.
- Do not install an upload SDK or error-monitoring SDK during Foundation merely to reserve a future choice. Add the selected R2-compatible upload client in the media milestone and Sentry or an equivalent in launch hardening, each behind the existing server boundary and environment validation.

### Git strategy

- Protect `main`; every implementation unit uses a short-lived branch and pull request.
- Use conventional, scoped commits where helpful: `feat(discovery):`, `fix(payments):`, `db:`, `test:`.
- Keep unrelated design/reference changes out of implementation commits.
- Never rewrite an applied migration. Add a new ordered migration and forward-fix production data/schema.
- Tag production releases and record the deployed application commit plus migration version.

### Migration workflow

1. Existing SQL migrations are the baseline.
2. Update Drizzle schema and add a new SQL migration together.
3. Apply from an empty database and from a copy of the previous schema in CI.
4. Run `scripts/verify_database.sh` plus integration/concurrency tests.
5. Use backward-compatible expand/contract changes; deploy schema before code that requires it.
6. Take/verify a backup before high-risk production migrations.

### Required CI checks

- dependency install from lockfile;
- formatting check and ESLint;
- TypeScript typecheck;
- unit tests;
- database migration and smoke tests;
- payment/ranking/auth integration tests against PostgreSQL;
- production Next.js build;
- Playwright smoke journeys at 375px and desktop;
- accessibility checks on critical public/auth pages;
- secret scanning and dependency vulnerability reporting.

### Testing boundaries

- **Unit:** Zod schemas, rank quote calculation, amount stepping, area conversions, route helpers and event validation.
- **Database integration:** simultaneous Rank contributions, category/city capacity, webhook duplicates/out-of-order events, reversal exactness, ownership session consumption and authorization queries.
- **Component/browser:** menus, dialogs, conditional portfolio fields, OTP states, upload recovery, fixed navigation clearance and keyboard focus.
- **End to end:** discovery → checkout test → webhook → onboarding OTP → owner edit → public profile; existing-owner top-up; delayed/failed payment; issue report → admin resolution.

### Deployment and rollback

- Vercel previews use test providers and isolated/non-production data.
- Real payments remain disabled through a server-side kill switch until legal, backup, monitoring and reconciliation checks pass.
- Deploy additive migrations before compatible code. Roll back application deployments through Vercel; forward-fix database migrations rather than running destructive down migrations.
- Keep webhook endpoints compatible across one previous application release so rollback does not drop events.
- Feature flags may gate real checkout, self-service city opening, outbid notifications and staff-access requests. Do not create a general feature-flag platform.
- A rollback never deletes captured payments or ledger entries. Reconciliation and compensating records restore business state.

## 13. Remaining contradictions and resolutions

| Conflict | Resolution for implementation |
| --- | --- |
| Master route list contains `/faq` and `/contact`, while newer decisions use combined Help | `/help` is canonical; `/faq` and `/contact` permanently redirect as defined above. |
| Older `before-start` paragraph says bottom label **Rank** | Latest decisions, active wireframe and master plan use **Position**. Position is authoritative. |
| MVP defer list says multiple staff accounts, but admin access/team wireframes support them | Keep multi-staff schema and role model. Bootstrap one administrator first; enable staff requests in the admin milestone. The stale defer line is superseded. |
| MVP defer list says multi-city launch waits for seeded supply, while newer rules allow first valid listing to open a city | Newer self-service rule wins. A recognized city may go live with one fulfilled entity but remains `noindex` until the content threshold. Root routing switches when city two is live. |
| Brand kit terracotta is `#C65D2E`, while UI uses `#C4512D` | Both are intentional roles: asset brand colour versus accessible UI action fill. Do not recolour the logo or replace the UI action token. |
| Brand docs mention a fixed 188×47 box, while the locked CSS uses height-only sizing | CSS uses `height: 47px; width: auto`; intrinsic dimensions reserve aspect ratio without a fixed CSS width. |
| Stack says Supabase Auth with WhatsApp-primary OTP, but provider capability is not yet proven | Confirm through a provider spike. Keep an adapter boundary and do not force the UX to match an unsupported delivery API. |
| RLS is described as secure but no policies exist | Current state is deny-all for direct clients. MVP uses server-only DAL. Add explicit policies only if direct client data access is introduced. |
| MVP includes notifications but there is no consent/delivery schema | Authentication OTP proceeds independently. Add notification preference/delivery tables before publication/outbid alerts are enabled. |
| `public_portfolio_items` exposes `pi.*` | Replace with an explicit public-column allowlist in the next security migration. |
| `realrank-original-index.html` contains the retired model | Preserve it as historical reference only; exclude it from implementation, tests and route generation. |

## 14. Implementation milestones and validation gates

### Milestone 0 — Foundation

- Scaffold Next.js/TypeScript with pnpm, App Router, CSS Modules, lint/type/test tooling and environment validation.
- Establish route groups, tokens, brand assets, shared shells, server-only boundaries and Drizzle mapping.
- Add the payment/concurrency/security migration identified in section 10.

**Gate:** clean CI; production build passes; empty database migrates; existing smoke tests pass; no server secret appears in the client bundle; route/access tests pass.

### Milestone 1 — Revenue and ownership vertical slice

- Indore discovery data, entry/claim quote, Razorpay test checkout, webhook fulfilment, payment status, onboarding session, WhatsApp/SMS test adapter and owner session.

**Gate:** duplicate/out-of-order webhook tests cannot double-credit; concurrent contributions reconcile; browser callback cannot fulfil; OTP limits/session consumption work; 375px and keyboard flows pass.

### Milestone 2 — Profiles and portfolio

- Shared public/owner profile components, profile editor, categories/social links, portfolio composer, R2 upload and item detail.

**Gate:** public and owner structures stay identical; owner authorization is enforced server-side; failed uploads preserve successes; structured dependencies and public-view allowlist tests pass.

### Milestone 3 — Position and cities

- Inline Rank top-up, target cue, shared total recalculation, three included city slots, city correction and self-service recognized-city activation.

**Gate:** stale quote is rejected/requoted; no fourth free slot under concurrency; slot fee never changes Rank total; city/category positions are deterministic; root/canonical switch tests pass.

### Milestone 4 — Insights and support

- Allowlisted analytics ingestion, owner Insights, contextual Help and persisted support workflow.

**Gate:** no PII in captured events; metric definitions match UI; owner can read only own insights; upload validation and support context preservation pass.

### Milestone 5 — Admin operations

- Staff access/MFA, queue, entity/payment/city/support records, team roles and audit events.

**Gate:** role matrix tests pass; pending staff cannot access data; high-risk actions require reason/audit; no admin route directly edits Rank total.

### Milestone 6 — Launch hardening

- Policies/legal content, metadata/JSON-LD, sitemap/indexation, pagination, monitoring, backups, reconciliation, load/performance and accessibility audits.

**Gate:** Vercel Pro and production providers configured; restore test completed; live-payment checklist signed off; Lighthouse/Playwright/axe targets pass; rollback rehearsal succeeds.

## 15. Final recommendation

After approval, begin Milestone 0. Do not add more broad screen variations, introduce microservices, build a generic design system or pre-emptively abstract every feature. The strongest path is a component-led modular monolith with PostgreSQL-enforced financial integrity, server-authoritative actions and one verified vertical slice before expanding the remaining surfaces.
