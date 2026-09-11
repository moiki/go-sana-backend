# Sana — Pharmacy Point of Sale

Monorepo for Sana, a drugstore point-of-sale system: a Go + MongoDB backend and
a React + antd frontend (Spanish-first).

## Infrastructure

```
                    +---------------- Sana (monorepo) ----------------+
    Browser --------> apps/web  Create React App 5 · React 18 · antd 4
                      (dev :3000, proxy /api -> :9000)
                          |
                          v /api/v1
    HTTPS ---------------> apps/api  Go 1.23 · Fiber v2 · JWT auth
                      (port :9000)
                          |
                          v
                    MongoDB Atlas (remote) — MONGO_URI in apps/api/.env
```

| Component | What it is | Notes |
|---|---|---|
| `apps/api` | Go API, module `github.com/moiki/sana/api` | `cmd/api` HTTP server, `cmd/sana-migrate` CLI, `internal/` split by concern (config, domain, store, http, middlewares, services, utils, app) |
| `apps/web` | React SPA (CRA 5 + antd 4 + styled-components) | Imported subtree of the former `go-sana-frontend` repo; keeps its own history |
| MongoDB | **Remote Atlas cluster** (no local Mongo service) | Connection string, db, credentials and secrets all come from `apps/api/.env` |
| Docker | Single `api` container (multi-stage `Dockerfile`) | `docker-compose.yml` builds it and injects `apps/api/.env`; healthchecks on `/health` + `/ready` |
| `libs/` | Shared Go modules (placeholder) | Wired via the root `go.work` workspace |

Key infra decisions:

- **No local Mongo container.** The project runs against Atlas; the compose file
  only runs the API and gets MongoDB credentials from `.env`.
- **Secrets live in `apps/api/.env`** (gitignored; template in
  `apps/api/.env.example`). Build and runtime never bake secrets into images
  (see `apps/api/.dockerignore`).
- **Health:** `GET /health` (liveness) and `GET /ready` (pings MongoDB through
  the shared client).

## Prerequisites

- Docker Desktop (for the Docker path)
- `apps/api/.env` with real values — copy the template:

```bash
cp apps/api/.env.example apps/api/.env   # then fill in MONGO_URI, JWT_SECRET, etc.
```

## Run with Docker

```bash
docker compose up --build -d        # build + start the API (Atlas via .env)
docker compose ps                   # wait until healthy
curl http://localhost:9000/health   # {"status":"ok"}
curl http://localhost:9000/ready    # Mongo reachable -> {"status":"ready"}
```

Run migrations / index seeding against Atlas from inside the container:

```bash
docker compose exec api sana-migrate -all   # indexes + seed admin (idempotent)
```

Logs and teardown:

```bash
docker compose logs -f api
docker compose down
```

## Run without Docker (dev)

Start both services from the repo root (Ctrl+C stops both, no orphans):

```bash
./dev.sh   # API on :9000 + web dev on :3000 (proxies /api)
```

Or individually:

```bash
go build ./apps/api/...                 # API build (workspace root)
go run ./apps/api/cmd/sana-migrate -all # indexes + seed (idempotent)
go run ./apps/api/cmd/api               # API on http://localhost:9000

pnpm -C apps/web install                # FE deps
pnpm -C apps/web dev                    # FE dev server on :3000 (proxies /api)
```

## Testing

```bash
go test ./apps/api/...    # unit tests (config, token, aggregations)
pnpm -C apps/web build    # FE production build
```

## Auth

Access token (24h) lives in memory; refresh token in an HttpOnly cookie with
automatic rotation. Login: `email + password + remember_me` against
`POST /api/v1/login`.

## Roadmap

See `DOCS/PLANS/` for the product plan. The MVP north star is a working cashier
flow: register → cart → payment → receipt with atomic stock.