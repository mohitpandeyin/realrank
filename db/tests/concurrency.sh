#!/bin/sh
set -eu

RR_PSQL="psql -X -v ON_ERROR_STOP=1 -q"
RR_RANK_ENTITY=90000000-0000-4000-8000-000000000001
RR_FILTER_ENTITY=90000000-0000-4000-8000-000000000002

$RR_PSQL <<SQL
INSERT INTO entities (
  id, public_name, public_slug, contact_method, contact_phone_e164,
  publication_status, moderation_status
) VALUES
  ('$RR_RANK_ENTITY', 'Concurrency Rank Fixture', 'concurrency-rank-fixture', 'CALL', '+919000000001', 'DRAFT', 'PENDING'),
  ('$RR_FILTER_ENTITY', 'Concurrency Filter Fixture', 'concurrency-filter-fixture', 'CALL', '+919000000002', 'DRAFT', 'PENDING');

INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id)
SELECT '$RR_FILTER_ENTITY', id FROM discovery_filters WHERE code IN ('RESIDENTIAL', 'COMMERCIAL');
SQL

(
  $RR_PSQL <<SQL
BEGIN;
INSERT INTO ranking_contributions (entity_id, amount_paise, source, reason_code)
VALUES ('$RR_RANK_ENTITY', 1000, 'PROMOTIONAL_CREDIT', 'CONCURRENCY_TEST_A');
SELECT pg_sleep(1);
COMMIT;
SQL
) &
RR_FIRST_PID=$!

(
  $RR_PSQL <<SQL
BEGIN;
INSERT INTO ranking_contributions (entity_id, amount_paise, source, reason_code)
VALUES ('$RR_RANK_ENTITY', 2000, 'PROMOTIONAL_CREDIT', 'CONCURRENCY_TEST_B');
COMMIT;
SQL
) &
RR_SECOND_PID=$!

wait "$RR_FIRST_PID"
wait "$RR_SECOND_PID"

RR_RANK_CHECK=$($RR_PSQL -Atc "
  SELECT shared_total_ranking_credit_paise = 3000
     AND shared_total_ranking_credit_paise = (
       SELECT sum(amount_paise) FROM ranking_contributions WHERE entity_id = '$RR_RANK_ENTITY'
     )
  FROM entities WHERE id = '$RR_RANK_ENTITY';
")

if [ "$RR_RANK_CHECK" != "t" ]; then
  echo "Concurrent Rank contributions did not reconcile" >&2
  exit 1
fi

(
  $RR_PSQL -c "
    INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id)
    SELECT '$RR_FILTER_ENTITY', id FROM discovery_filters WHERE code = 'LAND_PLOT';
  " >/dev/null 2>&1 || true
) &
RR_FILTER_FIRST_PID=$!

(
  $RR_PSQL -c "
    INSERT INTO entity_discovery_filters (entity_id, discovery_filter_id)
    SELECT '$RR_FILTER_ENTITY', id FROM discovery_filters WHERE code = 'LUXURY';
  " >/dev/null 2>&1 || true
) &
RR_FILTER_SECOND_PID=$!

wait "$RR_FILTER_FIRST_PID"
wait "$RR_FILTER_SECOND_PID"

RR_FILTER_COUNT=$($RR_PSQL -Atc "SELECT count(*) FROM entity_discovery_filters WHERE entity_id = '$RR_FILTER_ENTITY';")

if [ "$RR_FILTER_COUNT" -ne 3 ]; then
  echo "Concurrent discovery-filter writes bypassed the maximum-three rule" >&2
  exit 1
fi

echo "Realrank concurrency checks passed"
