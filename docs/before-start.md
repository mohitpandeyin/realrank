We are close. No more broad research is needed, but I recommend locking a few operational defaults before coding so payment and ownership flows do not need rebuilding later.

Brand identity lock — 3 November 2026

The official product spelling is **Realrank**, with only the initial **R** capitalised. **RealRank** is retired and must not appear in product copy, metadata, accessibility labels, transactional communication, policies or generated brand exports. Lowercase technical identifiers such as `realrank`, `rr-`, filenames, URLs and database fields remain unchanged.

The approved Realrank identity is the parcel-R and ascending-skyline mark in [`brand/final`](brand/final/README.md). Use the charcoal-and-terracotta horizontal SVG lockup in every public and signed-in header. Because the asset viewBox includes generous clear space, the wireframes reserve a 188 × 47px desktop box and 172 × 43px narrow-screen box; the visible logo remains compact within it. Browser tabs and sub-32px surfaces use the simplified micro icon; normal icon placements use the detailed icon. Preserve the supplied colors and aspect ratios, reserve intrinsic dimensions to prevent layout shift, provide **Realrank home** as the linked-logo accessible name, and keep the prescribed clear space. Do not recreate the old rounded-square **RR** placeholder, add a rank badge or trophy to the primary mark, recolor the files with CSS, or use the detailed skyline icon at favicon sizes. Terracotta remains the product's primary-action colour and charcoal remains the dominant identity colour, so the logo feels premium without changing the locked control hierarchy. The complete export matrix, dark and monochrome variants, favicons, PWA assets and regeneration instructions live in the final brand directory. All current HTML wireframes use the approved horizontal logo, micro favicon and charcoal browser theme colour.

Before production, convert the live wordmark text in the horizontal, stacked and wordmark SVGs to vector outlines, or embed the approved font inside those SVGs. This prevents fallback lettering on devices without Inter Tight; the icon-only SVGs are already fully path-based and the supplied high-resolution PNG/WebP lockups are a safe interim fallback.

Defaults I recommend using
Unless you disagree, I would build with these rules:
1. The submitted phone number becomes the public contact number, with clear consent beside the form.
2. WhatsApp is the default Contact action; owners can change it to Call later.
3. Categories are selected after payment. Until completed, the entity appears under All only.
4. Listings publish after captured payment unless duplicate or abuse checks flag them.
5. Matching entity name + phone opens a top-up flow; matching name with a different phone requires review.
6. Claim #N opens a target-aware listing flow for guests and a top-up flow for authenticated owners.
7. Phone OTP is mandatory to continue onboarding or access profile management. Closing the flow does not cancel an already-paid listing.
8. WhatsApp OTP is the primary account-verification delivery channel and SMS is the fallback. Other notifications require separate consent.
9. No text search until the index has roughly 25–50 genuine entities.
10. Refunds reverse ranking credit. Refunds are limited to technical failure, duplicate payment, Realrank rejection or legal requirements.
Flow wireframe drafts created — 10 September 2026
The four critical screens now have responsive functional drafts that use the locked Terracotta direction and `rr-` class prefix:
- [Delayed confirmation and failed-payment exception states](wireframes/realrank-payment-states.html)
- [Payment success, phone verification and profile setup](wireframes/realrank-payment-success-otp.html)
- [Owner dashboard, profile editor, portfolio and ranking top-up](wireframes/realrank-owner-dashboard.html)
- [Public entity profile and portfolio](wireframes/realrank-entity-profile.html)

These are flow and content references rather than a separate visual direction. Razorpay owns the secure payment-method UI; Realrank opens it directly from the validated listing or Claim action and handles the return, delayed-confirmation and failure states.
An administrator moderation screen can initially be utilitarian rather than visually polished.

Payment-flow update — 5 October 2026

There is no separate Realrank payment-review screen. The listing form or target-aware Claim action shows the target and exact amount, the server revalidates both on click, and Razorpay Checkout opens directly when they are unchanged. If the price or target changed, Realrank shows a compact inline update and requires one click on the revised action; it never silently charges a different amount. One common delayed-confirmation screen covers existing cities, a newly opened city, new listings and rank top-ups because the customer action is identical. It checks automatically, warns **Don't pay again yet**, and applies no publication or Rank-total change until the verified webhook arrives. Its compact copy control copies only the order ID and confirms the action. A prolonged delay reveals Support guidance. Show failure only after a definitive gateway failure; preserve the listing details for **Try payment again** or **Edit listing details**, while uncertain or possibly debited payments stay in delayed confirmation. The success/account-setup wireframe shows the fulfilled city and actual current position, then verifies the submitted number before profile completion.

Phone onboarding — 5 October 2026

After captured payment, the visible next goal is **Complete your profile**. Realrank reuses the submitted contact number in an editable **Mobile number** field and offers **Send code on WhatsApp** with **Send by SMS instead** as the quiet fallback. During the India-only launch, the input shows a fixed `+91` prefix and accepts exactly 10 Indian mobile digits; the backend normalizes the value to E.164. OTP completion creates the phone-authenticated account and links it to the paid entity through the short-lived payment-success session. The action changes from **Verifying…** to **✓ Number verified**, then the OTP form is replaced by a lean confirmation screen containing **Number verified**, one short entity-specific sentence, primary **Complete profile**, and quiet secondary **View public listing** actions. The compact payment-success banner remains above this screen to retain payment, live-listing, city and position confirmation, while the card does not repeat those details. The listing opens separately so onboarding remains available. The verified owner phone and public contact phone are separate fields even when initially equal. A successful OTP permits only the claim **Phone verified**. Recovery email or a connected Google identity is deferred to account settings and does not block MVP onboarding.

Profile experience — 7 October 2026

The public entity profile keeps one city-independent URL and shows every active city position directly; it does not hide cities behind a selector or change the profile into city-specific states. With the three-city cap, a short Bhopal #1 / Indore #3 style list is faster to scan and keeps the entity profile stable. Each city position uses its own row at every viewport width so long names and future movement labels remain readable. Do not show a generic trend icon: only show directional movement when it is calculated from real historical position data, paired with accessible text such as **Up 2 since yesterday**. The shared monetary Rank total appears once, categories show the union of active-city categories, and the portfolio shows all published items with explicit city metadata. The public page uses the same identity-first visual system as the owner Home view without exposing management navigation: a flat entity header, subtle position metadata, compact social-profile actions, a three-column desktop / two-column mobile visual portfolio grid and minimal details. Nested cards, side panels, repeated divider lines and a floating conversion bar are avoided; whitespace, typography and alignment provide grouping instead. The identity action row contains primary **Contact**, secondary **Follow**, and an icon-only notification control; notification preferences require a visitor account in production. Label the group **Realrank Index positions**, show Rank total once, and provide a quiet **How ranking works** link to Ranking Policy. Do not repeat sponsored or paid wording in details or footers. Verification signals follow the familiar social-profile pattern and sit directly beside the entity name as clean icons rather than pills or detached status rows. **Phone verified** appears only as proof of contact-number control and never implies business, RERA, identity or property verification. The signed-in profile preview follows the same logo → name and verification → description → categories → details hierarchy, using one quiet **Edit profile** control. The phone-first owner experience is one progressive management page rather than separate dashboard tabs. It presents the public-profile preview, Cities, Portfolio and Rank in that order. A persistent bottom navigation provides **Home**, **Portfolio**, **Rank** and **Account**; Cities remains directly below the profile because it is setup information rather than a frequent global destination. Profile and city changes open focused sheets only when requested. The header contains a lightweight Help menu for Get help, Report an issue and policy access, while private owner verification and sign-out remain under Account. Signed-in screens omit the marketing footer. Categories remain editable per active city, portfolio items carry city assignments, and a changed public contact number must be verified before publication. The dashboard does not assume an owner name, email login or email alerts.

At mobile widths, owner content uses a consistent 14px page gutter. Home, Cities, Portfolio and Rank headings, descriptions, lists and actions align to the same left and right edges. Section titles remain left-aligned, adjacent sections use 44px of whitespace instead of repeated divider rules, the portfolio uses a two-column visual grid, and only the persistent bottom navigation is full-width.

The public profile header contains only Browse index and the same compact Help control as the owner experience. Do not show a city pill because the profile is entity-wide and may represent multiple active cities. The dropdown contains **Get help**, **Report an issue** and **Ranking policy**; on narrow screens the visible Help label collapses to the icon while the accessible name remains intact.

The signed-in owner profile must reuse the public profile's actual identity, position, portfolio and details structures rather than maintain a second preview layout. Owners see the same profile hierarchy and visitor-action preview, with quiet Edit controls added to the relevant logo/profile, city-position, portfolio and details sections. Cities and Rank remain separate owner-only management sections below the shared profile foundation.

The owner Rank top-up action uses the outcome-specific label **Add ₹X to Rank total**, updated live with the selected amount. Avoid vague wording such as **Add more amount**, non-standard wording such as **Add rank-up amount**, and process-oriented **Continue to payment**.

Public Claim actions use **Claim #N for ₹X**, where ₹X is the full target Rank Amount for a new or unidentified entity. Once an owner is authenticated, ₹X may instead be the freshly calculated top-up difference from that entity's current Rank total. A position is never reserved before captured payment and idempotent fulfilment.

Homepage QA lock — 14 September 2026

The Terracotta homepage wireframe has completed its final UX, responsive, accessibility and performance-oriented QA pass. Do not add further homepage sections before implementation. The authoritative interaction, hierarchy, trust, filter, amount-stepper and responsive decisions are recorded under **Homepage final QA lock** in the master product plan.

Multi-city model — 16 September 2026

Realrank uses city-specific public indexes, not state or All India entity rankings. An entity has one shared Rank total and three editable active-city slots (City 1, City 2, City 3). A valid but mistaken initial city does not cancel the paid entity: after account setup, the owner can correct that slot without paying entry again. A fourth simultaneous city requires a separately itemized, one-time purchase of another city slot; the slot can later be reassigned, and its fee never increases Rank total. The extra-slot price remains to be decided before paid expansion launches. See the master product plan for the authoritative rules and data model.

The header city picker now offers **Add a city**, not Coming soon. Its registration dialog mirrors the hero's entity name, contact and Rank Amount fields and adds a searchable canonical city-and-state picker. A recognised city can open publicly with its first valid listing after captured payment and safety checks; it remains `noindex` until useful real supply exists. An unmatched city must be reviewed before checkout. Existing owners use their included or purchased city slots instead of paying a second ₹10 entry. The homepage wireframe demonstrates the popup only; it does not process payments or create production city pages.

City data is stored in Realrank's own PostgreSQL catalogue rather than queried from a third-party places API during checkout. Seed and periodically reconcile it from LGD Urban Local Bodies, with Census location codes as a secondary reference. Keep canonical cities, aliases and external source references in separate tables. Maintain separate `catalog_status` (AVAILABLE/REVIEW/BLOCKED/RETIRED) and `realrank_status` (UNOPENED/LIVE/EMPTY/SUSPENDED) fields so official city validity is not confused with whether Realrank currently has a public index there. Source synchronization must never silently delete a live URL or rename its slug.

Build and launch preparation
Before development:
- Commit and push the latest locked documentation.
- Create a clean environment-variable template without real secrets.
- Prepare representative seed entities and empty/loading/error states.
- Define the database schema and migrations before building UI forms.
- Use Razorpay Test Mode throughout development.
Before accepting real payments:
- Activate Razorpay and complete its required business onboarding.
- Upgrade from Vercel Hobby.
- Configure an approved WhatsApp OTP provider, SMS fallback, CAPTCHA, resend limits and applicable India messaging registrations.
- Establish tested PostgreSQL backups.
- Publish Ranking Policy, Terms, Privacy and Refund Policy.
- Confirm GST/invoicing treatment with an Indian accountant.
- Test payment success, delayed webhook, duplicate webhook, failed payment, refund and chargeback flows.
My recommended next move is to checkpoint the documentation, create the four remaining low-fidelity flow wireframes, and then build one complete vertical journey:
Landing → payment → captured webhook → listing published → WhatsApp/SMS phone OTP → profile editing.
That will validate the hardest part of Realrank before expanding the rest.
