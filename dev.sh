#!/usr/bin/env bash
set -euo pipefail
set -m # job control: give each background service its own process group

API_DIR="apps/api"
WEB_DIR="apps/web"
API_PORT="${API_PORT:-9000}"
WEB_PORT="${WEB_PORT:-3000}"

log() { printf '\033[1;34m[dev]\033[0m %s\n' "$*"; }
err() { printf '\033[1;31m[dev]\033[0m %s\n' "$*" >&2; }

usage() {
  cat <<'EOF'
Usage: ./dev.sh [--help]

Runs the Sana stack locally WITHOUT Docker:
  API  ->  go run ./apps/api/cmd/api        (http://localhost:9000)
  FE   ->  pnpm -C apps/web dev             (http://localhost:3000, proxies /api to :9000)

Requires Go 1.23+ and pnpm (if missing: corepack enable).
Optional env overrides: API_PORT, WEB_PORT.
Press Ctrl+C to stop both services.
EOF
}

require_cmd() {
  local cmd="$1" hint="${2:-}"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    err "missing required command: $cmd"
    if [[ -n "$hint" ]]; then err "$hint"; fi
    exit 1
  fi
}

cleanup() {
  trap - INT TERM EXIT
  for pid in "${API_PID:-}" "${WEB_PID:-}"; do
    if [[ -n "$pid" && "$pid" != "0" ]]; then
      # Negative PID = whole process group (covers go run child + pnpm node tree).
      kill -TERM -- -"$pid" 2>/dev/null || kill -TERM "$pid" 2>/dev/null || true
    fi
  done
  wait 2>/dev/null || true
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

require_cmd "go" "Install Go 1.23+ or set PATH."
require_cmd "pnpm" "Install pnpm via: corepack enable  (npm i -g pnpm also works)."

if [[ ! -f "$API_DIR/.env" ]]; then
  err "WARNING: $API_DIR/.env not found — copy apps/api/.env.example to $API_DIR/.env"
fi
[[ -d "$API_DIR/cmd/api" ]] || { err "ABORT: $API_DIR/cmd/api not found (run from repo root)."; exit 1; }
[[ -d "$WEB_DIR/src" ]]   || { err "ABORT: $WEB_DIR/src not found (run from repo root)."; exit 1; }

trap cleanup INT TERM EXIT

log "starting API (go run ./$API_DIR/cmd/api) on :$API_PORT ..."
(
  cd "$API_DIR"
  exec go run ./cmd/api
) &
API_PID=$!

log "starting web (pnpm dev in ./$WEB_DIR) on :$WEB_PORT ..."
(
  cd "$WEB_DIR"
  exec pnpm dev
) &
WEB_PID=$!

log "Sana dev stack up:"
log "  API  http://localhost:$API_PORT   (health: /health, Mongo ping: /ready)"
log "  Web  http://localhost:$WEB_PORT"
log "Press Ctrl+C to stop both services."

wait "$API_PID" "$WEB_PID"