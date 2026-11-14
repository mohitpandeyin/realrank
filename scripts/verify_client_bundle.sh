#!/bin/sh
set -eu

RR_CLIENT_BOUNDARY_REPORT=$(mktemp "${TMPDIR:-/tmp}/realrank-client-boundary.XXXXXX")
trap 'rm -f "$RR_CLIENT_BOUNDARY_REPORT"' EXIT INT TERM

if [ ! -d .next/static ]; then
  echo "Client bundle is missing. Run the production build first." >&2
  exit 1
fi

if rg -l \
  'DATABASE_URL|gateway_webhook_events|payment_success_sessions|The current actor does not have' \
  .next/static >"$RR_CLIENT_BOUNDARY_REPORT"; then
  echo "Server-only identifiers were found in client assets:" >&2
  cat "$RR_CLIENT_BOUNDARY_REPORT" >&2
  exit 1
fi

echo "Client assets contain no known server-only identifiers."
