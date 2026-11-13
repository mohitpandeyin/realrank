#!/bin/sh
set -eu

RR_REPO_ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
RR_DB_VERIFY_DIR=$(mktemp -d "${TMPDIR:-/tmp}/realrank-db-verify.XXXXXX")
RR_DB_VERIFY_PORT=55439
RR_DB_VERIFY_STARTED=0

rr_cleanup() {
  if [ "$RR_DB_VERIFY_STARTED" -eq 1 ]; then
    pg_ctl -D "$RR_DB_VERIFY_DIR/data" -m fast -w stop >/dev/null 2>&1 || true
  fi
  rm -rf "$RR_DB_VERIFY_DIR"
}
trap rr_cleanup EXIT INT TERM

while pg_isready -q -h 127.0.0.1 -p "$RR_DB_VERIFY_PORT"; do
  RR_DB_VERIFY_PORT=$((RR_DB_VERIFY_PORT + 1))
done

initdb -D "$RR_DB_VERIFY_DIR/data" -A trust -U postgres --no-locale >/dev/null
pg_ctl -D "$RR_DB_VERIFY_DIR/data" -o "-h 127.0.0.1 -p $RR_DB_VERIFY_PORT -F" -w start >/dev/null
RR_DB_VERIFY_STARTED=1
createdb -h 127.0.0.1 -p "$RR_DB_VERIFY_PORT" -U postgres realrank_verify

for RR_MIGRATION in "$RR_REPO_ROOT"/db/migrations/*.sql; do
  psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p "$RR_DB_VERIFY_PORT" -U postgres -d realrank_verify -f "$RR_MIGRATION" >/dev/null
done

psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p "$RR_DB_VERIFY_PORT" -U postgres -d realrank_verify -f "$RR_REPO_ROOT/db/seeds/development.sql" >/dev/null
psql -X -v ON_ERROR_STOP=1 -h 127.0.0.1 -p "$RR_DB_VERIFY_PORT" -U postgres -d realrank_verify -f "$RR_REPO_ROOT/db/tests/schema_smoke.sql"
