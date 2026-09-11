# Sana — Pharmacy Point of Sale

Monorepo for Sana, a drugstore point-of-sale system: Go + MongoDB backend and a
React + antd frontend (Spanish-first).

```
apps/api   Go 1.23 · Fiber v2 · MongoDB · JWT auth · module github.com/moiki/sana/api
apps/web   Create React App 5 · React 18 · antd 4 · styled-components (subtree of go-sana-frontend)
libs/      shared Go modules (placeholder)
```

## Quick start

```bash
docker compose up                   # Mongo + API (healthy, on :9000)
go run ./apps/api/cmd/sana-migrate -all   # indexes + seed (from repo root)
pnpm -C apps/web install             # FE deps
pnpm -C apps/web dev                 # FE dev server on :3000 (proxies /api to :9000)
```

Health checks: `GET /health` (liveness), `GET /ready` (Mongo ping).

## Development

```bash
go build ./apps/api/...   # API build (workspace root)
go test ./apps/api/...    # unit tests (config, token, aggregations)
docker compose up         # Mongo + API in containers
pnpm -C apps/web build    # FE production build
```

Auth: access token in memory, refresh token in an HttpOnly cookie, automatic
refresh on the frontend. Login: `email + password + remember_me` against
`POST /api/v1/login`.

## Roadmap

See `DOCS/PLANS/` for the product plan. The MVP north star is a working cashier
flow: register → cart → payment → receipt with atomic stock.