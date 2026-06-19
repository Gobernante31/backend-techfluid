#!/usr/bin/env bash
# Local API smoke tests using curl. Run this against a running local worker.

set -euo pipefail

API_URL=${API_URL:-http://127.0.0.1:8787}

echo "Health check: ${API_URL}/health"
curl -sS ${API_URL}/health | jq || true

echo "List validations: ${API_URL}/verification"
curl -sS ${API_URL}/verification | jq || true

if [ "${ALLOW_SEED:-false}" = "true" ]; then
  echo "Seeding demo validations (ALLOW_SEED=true)"
  curl -sS -X POST ${API_URL}/verification/seed | jq || true
fi

echo "Creating a sample validation via POST"
RESP=$(curl -sS -X POST "${API_URL}/verification" -H "Content-Type: application/json" -d '{"name":"Smoke Test","email":"smoke@example.com","documentNumber":"S123","selfieImage":"data:image/png;base64,iVBORw0KGgo=","documentImage":"data:image/png;base64,iVBORw0KGgo="}')
echo "$RESP" | jq || true

ID=$(echo "$RESP" | jq -r '.id')
if [ -n "$ID" ] && [ "$ID" != "null" ]; then
  echo "GET created validation"
  curl -sS ${API_URL}/verification/${ID} | jq || true

  echo "PATCH status -> approved"
  curl -sS -X PATCH ${API_URL}/verification/${ID}/status -H "Content-Type: application/json" -d '{"status":"approved"}' | jq || true
fi

echo "Done"
