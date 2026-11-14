# Realrank database

This directory contains the pre-build PostgreSQL contract for Realrank. It targets PostgreSQL 15+ and is compatible with a Supabase-hosted PostgreSQL database.

## Migration order

1. `0001_identity_and_catalog.sql` — owners, entities, canonical cities and property/discovery lookups.
2. `0002_coverage_payments_and_ranking.sql` — city coverage, checkout/payment allocation and the append-only Rank ledger.
3. `0003_portfolio.sql` — generic portfolio items plus optional Project, media, configuration, registration and taxonomy extensions.
4. `0004_integrity_views_and_security.sql` — cross-table validation, cached Rank-total maintenance, public ranking views, indexes and secure-by-default row-level security.
5. `0005_payment_ownership_and_security.sql` — concurrency-safe Rank totals, payment-allocation idempotency, ownership-onboarding sessions, phone-verification invariants and explicit public-view columns.

The sequence is additive: later migrations add tables, constraints, indexes, functions and views. They do not rename or drop customer data. A legacy import must retain its original values in the dedicated legacy columns until owners confirm ambiguous mappings.

## Development fixtures

`seeds/development.sql` implements the records specified in [`docs/representative-seed-data.md`](../docs/representative-seed-data.md). It is deterministic, fictional and development-only. Never run it against production.

## Local verification

Run:

```sh
./scripts/verify_database.sh
```

The script creates a temporary local PostgreSQL cluster, applies every migration in filename order, loads the development fixtures and runs `tests/schema_smoke.sql`. It removes the temporary cluster when finished.

To verify the additive upgrade path from the checkpoint schema and fixtures, run:

```sh
RR_DB_VERIFY_MODE=upgrade ./scripts/verify_database.sh
```

Both modes also run concurrent Rank-contribution and category-cap checks against the temporary database.

Application migrations should eventually be generated and tracked by Drizzle, but these SQL files remain the authoritative pre-build schema contract. Do not let an ORM silently weaken database checks or replace the immutable payment/Rank ledgers with mutable totals.
