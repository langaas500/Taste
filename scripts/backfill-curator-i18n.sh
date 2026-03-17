#!/bin/bash
# Backfill curator i18n text (sv/da/fi) for SEO title pages.
# Usage: BACKFILL_SECRET=xxx ./scripts/backfill-curator-i18n.sh

set -euo pipefail

if [ -z "${BACKFILL_SECRET:-}" ]; then
  echo "ERROR: BACKFILL_SECRET environment variable is not set."
  echo "Usage: BACKFILL_SECRET=xxx ./scripts/backfill-curator-i18n.sh"
  exit 1
fi

URL="https://logflix.app/api/cron/generate-metadata"
ROUNDS=20
PAUSE=3
SUCCESS=0

echo "Starting backfill: $ROUNDS rounds × 20 titles = $((ROUNDS * 20)) titles max"
echo "────────────────────────────────────────"

for i in $(seq 1 $ROUNDS); do
  echo ""
  echo "Round $i/$ROUNDS"

  HTTP_CODE=$(curl -s -o /tmp/backfill_response.json -w "%{http_code}" \
    -X POST "$URL" \
    -H "x-backfill-secret: $BACKFILL_SECRET" \
    -H "Content-Type: application/json")

  BODY=$(cat /tmp/backfill_response.json)
  echo "  HTTP $HTTP_CODE — $BODY"

  if [ "$HTTP_CODE" != "200" ]; then
    echo ""
    echo "ERROR: HTTP $HTTP_CODE — stopping."
    break
  fi

  if echo "$BODY" | grep -q '"error"'; then
    echo ""
    echo "ERROR: Response contains error — stopping."
    break
  fi

  if echo "$BODY" | grep -q '"status":"done"'; then
    echo ""
    echo "All titles processed — no more pending."
    SUCCESS=$i
    break
  fi

  SUCCESS=$i

  if [ "$i" -lt "$ROUNDS" ]; then
    echo "  Waiting ${PAUSE}s..."
    sleep $PAUSE
  fi
done

echo ""
echo "════════════════════════════════════════"
echo "Done. Successful rounds: $SUCCESS/$ROUNDS"
