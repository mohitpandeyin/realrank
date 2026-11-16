# Realrank implementation progress

**Last updated:** 16 November 2026

**Current branch:** `codex/milestone-1-listing-entry`

**Current milestone:** Milestone 1 — Revenue and ownership vertical slice

**Current slice:** Listing entry and server-calculated Rank quote

## Completed

- [x] Pre-development product and wireframe review
- [x] Final implementation blueprint approved
- [x] Milestone 0 Next.js foundation
- [x] Public, transaction, owner and admin route shells
- [x] PostgreSQL/Drizzle schema mapping
- [x] Additive payment, ownership and ranking-integrity migration
- [x] Unit, database, build and responsive browser checks
- [x] Locked Indore discovery homepage rendered from PostgreSQL
- [x] Stable primary and More discovery filters with filtered ranking positions
- [x] Responsive entity cards, quiet Contact action and compact Claim action
- [x] Floating List your Entity action after the hero leaves the viewport
- [x] Empty, missing-description, long-name and tied-rank handling
- [x] Discovery slice approved for incremental continuation

## In progress

- [ ] Listing-entry slice awaiting product review

## Listing-entry slice completed

- [x] Restored the locked listing form inside the homepage hero
- [x] Validated entity name, Indian mobile number and whole-rupee Rank Amount on the server
- [x] Kept free-form amount entry while stepping `+ / −` to adjacent ₹10 values
- [x] Calculated estimated position from fresh PostgreSQL ranking data
- [x] Routed entity Claim actions back to the shared listing form
- [x] Validated desktop, mobile, keyboard and error states

## Locked implementation decisions

- Keep the existing foundation; do not restart from a basic scaffold.
- Build one complete vertical slice at a time and stop for review between slices.
- PostgreSQL remains authoritative for public ranking data and transactional state.
- Server Components remain the default; browser code is added only for real interaction.
- Use MSG91 behind an `OtpProvider` boundary rather than coupling account logic to its API.
- Use managed MSG91 SMS OTP as the dependable launch baseline.
- Treat WhatsApp OTP as an optional channel subject to Meta eligibility, with SMS fallback.
- Do not build or store a custom OTP implementation in Realrank.

## Next slices after discovery approval

1. Razorpay Test order creation and verified webhook fulfilment.
2. Payment status and one-time ownership onboarding session.
3. MSG91 test OTP adapter, verification limits and owner session.

## Deferred

- Production MSG91 and Meta onboarding credentials
- Production WhatsApp authentication eligibility confirmation
- Production Razorpay, storage, analytics and monitoring credentials
- Portfolio, city management, Insights, support and admin operations

## Validation log

| Date        | Scope                                            | Result |
| ----------- | ------------------------------------------------ | ------ |
| 16 Nov 2026 | Milestone 0 full validation                      | Passed |
| 16 Nov 2026 | Discovery lint, types and unit tests             | Passed |
| 16 Nov 2026 | Fresh and upgrade database verification          | Passed |
| 16 Nov 2026 | Mobile and desktop browser journeys (16 checks)  | Passed |
| 16 Nov 2026 | Production build and client-bundle scan          | Passed |
| 16 Nov 2026 | Seeded visual review at 320px, 375px and desktop | Passed |
| 16 Nov 2026 | Listing-entry unit tests                         | Passed |
| 16 Nov 2026 | Listing-entry mobile and desktop journeys        | Passed |
| 16 Nov 2026 | Seeded PostgreSQL Rank quote                     | Passed |
| 16 Nov 2026 | Listing-entry production build and bundle scan   | Passed |
