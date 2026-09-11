# P1 — Sana POS: Monorepo + Product Foundation

## Goal (north star)

> A cashier opens a register, scans a barcode, sells, takes payment and prints a
> receipt — **stock decreases atomically** — and a manager closes the day with
> reconciled numbers. Nothing else ships before this works.

This phase transforms the current catalog editor + write-only sales table into a
real product foundation. It is a **breaking change**: repo becomes a monorepo,
module is renamed, backend moves to `internal/`, the data model gets a
transaction-aware design, and a React frontend is introduced.

## Locked decisions

| Decision | Choice | Note |
|---|---|---|
| Database | **Keep MongoDB** | Schema rework + `withTransaction` + atomic counters for money/stock integrity |
| Frontend | **Vite React SPA + PWA** | Spanish UI, tablet-first cashier |
| Billing | **Sequential ticket now** | Local counter per register + 80mm thermal receipt; fiscal/e-invoicing isolated behind a `receipt` boundary for later |
| Stores | **Single store, 1–3 terminals** | Model is `store_id`-aware but deploys single-store; multi-store is a later config, not a rewrite |
| Module rename | **Rename to `github.com/moiki/sana/api`** | Done during this breaking restructure; the old `go-sana-blackend` typo is not carried forward |
| Tests | **Go `testing` + testify, real Mongo integration** | Unit tests now; money/stock integration tests in Phase 3 |

## Target repo layout

```
sana/
├── go.work                          # Go workspace: apps/ + libs/
├── AGENTS.md                        # monorepo agent instructions (updated)
├── DOCS/PLANS/                      # product + phase plans
├── apps/
│   ├── api/                         # backend (module github.com/moiki/sana/api)
│   │   ├── cmd/
│   │   │   ├── api/                 # HTTP server entrypoint
│   │   │   └── sana-migrate/        # indexes + seed CLI
│   │   ├── internal/
│   │   │   ├── config/              # typed EnvData + envOr
│   │   │   ├── domain/              # entities (package models) + index defs
│   │   │   ├── store/               # Mongo client, collections, transactions (package connections)
│   │   │   ├── middlewares/         # JWT, request-id, access log
│   │   │   ├── services/            # business logic (auth/inventory/sales; split per context in Phase 1+)
│   │   │   ├── http/                # handlers + route registration (package routes)
│   │   │   └── utils/               # jwt, pipelines, snippets, validation
│   │   ├── json/aggregations/       # reference pipeline JSON (Go pipelines are source of truth)
│   │   ├── skills/                  # project skills (moved)
│   │   ├── .env.example
│   │   ├── Dockerfile
│   ├── web/                         # frontend (Vite + React + TS + PWA)
└── libs/                            # shared Go modules (sanacore: for sana-agent later)
```

Phase 0 keeps **package identities** (`models`, `connections`, `routes`,
`middlewares`, `utils`, `services`) so the migration is byte-identical behavior.
Splitting `services` into bounded contexts happens with the Phase 1 schema
rewrite, under tests.

## Phase 0 tasks

### Group A — Monorepo restructure (foundation)
- [ ] **A1** Move current project into `apps/api/` preserving history (`git mv`); create `go.work`; create `apps/web/` and `libs/`.
- [ ] **A2** Rename module to `github.com/moiki/sana/api`; sweep all `go-sana-blackend` imports; build from workspace root.
- [ ] **A3** Confirm `.env`/`.env.example`/`godotenv` resolve from `apps/api/`.

### Group B — Backend re-layout into `internal/` (no behavior change)
- [ ] **B1** Move packages: `models → internal/domain`, `connections → internal/store`, `routes → internal/http`, `middlewares`, `utils` (config → `internal/config`), `services`; `server.go → cmd/api/main.go`. Fix imports; no logic change.
- [ ] **B2** Parity smoke test: login → `/me` → refreshToken (rotation) → logout must behave identically.

### Group C — Tooling rails
- [ ] **C1** `slog` JSON access log + request-ID middleware.
- [ ] **C2** `GET /health` (liveness) and `GET /ready` (Mongo ping).
- [ ] **C3** `store.WithTransaction(ctx, fn)` helper (used from Phase 3).
- [ ] **C4** `sana-migrate` CLI: `indexes` (idempotent, fixes the `snProductPresentations` `bsonx` index) + `seed` (admin user). Server startup keeps its idempotent seed guard.
- [ ] **C5** Multi-stage `Dockerfile` + `docker-compose.yml` (mongo + api, healthchecks).
- [ ] **C6** GitHub Actions CI: `go build/vet/gofmt/test` + web `npm ci && npm run build`.
- [ ] **C7** First unit tests: `token`, `config` (envOr/COOKIE_SECURE), `ParsePipeline` stage order.

### Group D — Frontend skeleton (Vite SPA + PWA)
- [ ] **D1** Scaffold `apps/web`: Vite + React 18 + TS + Tailwind + React Router + TanStack Query + Zustand + `vite-plugin-pwa`.
- [ ] **D2** Typed API client with `withCredentials` + in-memory token + 401 auto-refresh interceptor (cookie contract).
- [ ] **D3** Auth feature: login (email/password/remember_me), route guards via `/me`.
- [ ] **D4** Layout shell (sidebar/topbar/logout) + placeholder routes for POS / Inventory / Sales / Reports / Admin.
- [ ] **D5** Verify `npm run build`; login persists across reload via cookie refresh.

### Group E — Docs, skills, gates
- [ ] **E1** Rewrite `AGENTS.md` (monorepo, commands, rename note, tests exist); move `skills/` → `apps/api/skills/` and fix references; refresh `README.md`.
- [ ] **E2** Final gate: workspace `go build ./...`, `go vet`, `gofmt -l`, `go test ./...`, `npm run build`, `docker compose up` health + login smoke, `sana-migrate` runs clean.

## Verification / exit criteria for Phase 0

1. `git clone` → `docker compose up` → API + Mongo healthy, `/health` + `/ready` green.
2. `go test ./...` green at workspace root.
3. `npm run build` green in `apps/web`.
4. Cookie auth flow functionally identical to pre-migration.
5. `sana-migrate indexes` + `sana-migrate seed` idempotent on a fresh/current DB.

## What comes next (later phases)

1. Catalog CRUD + price lists + RBAC + settings (FE: inventory admin).
2. Inventory: lots/expiry, stock movements ledger, adjustments, alerts, purchasing.
3. **POS** (MVP target): register, cart → payment → receipt, atomic stock, returns.
4. Reports: daily close, dashboard, history, exports; customers.
5. Hardening: money/stock test coverage, perf, deployment, backups.
6. (parked) `sana-agent` AI chatbox microservice (see `DOCS/PLANS/chatbox-feature.md`).