# AGENTS.md — Sana (monorepo)

Go backend + React frontend for a drugstore point-of-sale ("Sana").
- `apps/api` — Go 1.23, Fiber v2 (v2.52.x), MongoDB, JWT auth
- `apps/web` — Create React App 5 + React 18 (JS) + antd 4 + styled-components + pnpm
- `libs/` — shared Go modules (currently empty)

Go workspace is at the repo root (`go.work`). **Always run Go commands from the
repo root** so the workspace resolves `apps/api` and future `libs`. `apps/web`
is an imported subtree of the former `go-sana-frontend` repo and keeps its own
git history.

## Commands

```bash
./dev.sh                        # run API + web locally WITHOUT Docker (Ctrl+C stops both)
go build ./apps/api/...   # compile the API module (workspace root)
go vet ./apps/api/...     # static analysis (expected pre-existing warnings remain)
gofmt -l apps/api          # list unformatted files
go test ./apps/api/...    # unit tests (config, utils/token, utils/aggregations)
pnpm -C apps/web install  # install FE deps (pnpm; frozen via pnpm-lock.yaml)
pnpm -C apps/web dev      # FE dev server (CRA react-scripts, port 3000, proxies /api to :9000)
pnpm -C apps/web build    # FE production build
go run ./apps/api/cmd/api         # start API on http://localhost:9000
go run ./apps/api/cmd/sana-migrate -all   # indexes + seed (idempotent)
docker compose up                 # mongo + api (local, uses docker-compose.yml)
```

Tests exist (Go `testing` + testify). Integration tests touching MongoDB are
added in later phases — do not add Mongo-dependent tests without asking.

## Runtime requirements

- MongoDB reachable at `MONGO_URI`, using database `MONGO_DB`.
- `apps/api/.env` (gitignored — never commit; see `apps/api/.env.example`).
- On first startup `connections.DefaultUser` seeds the admin account from
  `DEF_USER` / `DEF_PASS` (idempotent). Default login = `DEF_USER` + `DEF_PASS`.
- Docker: `docker compose up` provides mongo + api with healthchecks.

## Architecture (request flow)

```
HTTP -> internal/http (Fiber handlers) -> internal/services (business logic + DB) -> internal/store (shared Mongo client) -> MongoDB
                                    |
                            domain shapes in internal/domain
```

| Layer | Path | Responsibility | Examples |
|---|---|---|---|
| `internal/http` | `apps/api/internal/http/` | Bind URL → handler; parse body/query; return JSON (package `routes`) | `auth.routes.go`, `inventory.routes.go` |
| `internal/services` | `apps/api/internal/services/` | Queries, pipelines, business rules; own package-level collections | `ListProducts`, `RefreshToken`, `CreateProduct` |
| `internal/store` | `apps/api/internal/store/` | Shared Mongo client (`Connect`), `GetCollection`, `EnsureIndex`, `WithTransaction`, `Ping` (package `connections`) | `GetCollection("snProducts", ...)` |
| `internal/domain` | `apps/api/internal/domain/` | Structs + bson/json tags, index definitions, `NewX()` constructors (package `models`) | `Product`, `NewProduct()` |
| `internal/config` | `apps/api/internal/config/` | Typed `EnvData` (reads `.env` once) | `EnvData.MongoUri` |
| `internal/utils` | `apps/api/internal/utils/` | JWT, pipeline parsing, validation | `ParsePipeline`, `ModelValidation`, token helpers |
| `internal/app` | `apps/api/internal/app/` | Fiber wiring: logs, request-id, CORS, `/health`, `/ready` | `app.New()`, `app.Run()` |

**Note on package identifiers:** `internal/http` declares `package routes`,
`internal/store` declares `package connections`, `internal/domain` declares
`package models`. Imports bind to those names. This preserves package identity
from before the refactor; a bounded-context split is planned for Phase 1.

The old module path `go-sana-blackend` no longer exists. The API module is
`github.com/moiki/sana/api`. Do not reintroduce it.

## Conventions (must follow)

- **Collection names** are prefixed `sn`: `snUsers`, `snProducts`,
  `snProductPresentations`, `snProviders`, `snLaboratories`,
  `snSales`, `snSessions`. Get them once via
  `connections.GetCollection(name, connections.IndexOptions{HasIndex: true, Indexes: models.<X>Index})`.
  Reuse the shared client — never open your own `mongo.Connect`.
- **Every persisted struct**: all fields EXPORTED, every field tagged with
  explicit `bson:"..."`. Unexported fields are dropped silently by the driver.
- **Every model has a `NewX()` constructor** that stamps `uuid.New()` +
  `CreatedAt` plus sensible defaults. Call it BEFORE `ctx.BodyParser` so the
  incoming body overwrites defaults.
- **Passwords** are bcrypt hashes via `User.HashPassword` / `User.CheckPassword`.
- **Secret fields** (`Password`, `RefreshToken`) carry `json:"-"`.
- **JWT secrets** come from env `JWT_SECRET` / `JWT_REFRESH_SECRET`. New env vars
  go in `apps/api/.env.example` too. Log level via `LOG_LEVEL` (debug|info|warn|error).
- **Aggregation pipelines**: `[]bson.M` + `utils.ParsePipeline`. Maps reorder
  keys and `$skip`/`$facet` are order-sensitive — never marshal stages by hand.
- **Protected endpoints** wrap handlers with `middlewares.JWTProtected()`.
  After it runs, the parsed JWT is at `ctx.Locals("user")` (a `*jwt.Token`).
- **Validation**: `utils.ModelValidation.Struct(x)` using `validate:"..."` tags.
- **Errors**: services return `error`; handlers respond `ctx.Status(NNN).JSON(&fiber.Map{"error": ...})`.
- **Responses**: `fiber.Map` for JSON bodies.
- **Transactions**: `connections.WithTransaction(ctx, fn)` — money/stock writes
  MUST go through it from Phase 3 forward. Requires replica set/Atlas.
- **Frontend**: `apps/web/src/services/auth/rest.js` is the single axios instance
  (`withCredentials: true`) with a 401 → cookie-refresh retry interceptor
  (singleflight). Access token lives in memory; refresh happens automatically via
  the HttpOnly cookie. Never store the access token in localStorage. UI is antd 4
  + styled-components; forms use react-hook-form.

## Adding an endpoint

Follow the `sana-add-endpoint` skill for the full walkthrough:

1. Model (`internal/domain/`): struct + `NewX()` + index block.
2. Service (`internal/services/`): package-level collection + function returning `(result, error)`.
3. Handler + route registration (`internal/http/`).
4. `middlewares.JWTProtected()` unless the route is public (only `/login`,
   `/refreshToken`, `/logout` are public today).
5. Verify with `go build ./apps/api/...` from repo root and `gofmt -w <files>`.

## Gotchas

- **Auth**: access token 24h returned in JSON body; refresh token lives ONLY in
  the HttpOnly cookie `refresh_token` (Path `/api/v1`, SameSite Lax, Secure via
  `COOKIE_SECURE`). Login accepts `remember_me` (bool): true → 30-day session,
  false → 24h. Refresh ROTATES the cookie + token and reads `remember_me` back
  from `snSessions`. `/logout` blocks the session and clears the cookie. Never
  echo the received refresh token back. The FE already implements this contract.
- **FE dev**: CRA dev server proxies `/api` to `http://localhost:9000`
  (`package.json > proxy`). `apps/web/.env` sets `REACT_APP_REST_DEV_URL`
  (gitignored). Production build is served by `apps/web/server.js` (express).
- **Subtree**: `apps/web` keeps the history of its source repo
  (`git subtree pull --prefix apps/web <repo> develop` to update it).
- **Table routes** read `per_page`, `page`, `filter` via `TableParams` +
  `ctx.QueryParser` (defaults: per_page 10, page 1). `ListProducts` returns a
  `$facet` result `{ total, docs }`.
- **JSON pipelines** under `apps/api/json/aggregations/` feed
  `utils.GeneratePipelineFromJSON`, but live routes use the Go pipelines built
  with `utils.ParsePipeline`. To change behavior, edit the Go pipelines, not the
  JSON files.
- **Beware int16 pagination math**: `perPage * (page - 1)`; clamp inputs.
- **Health**: `GET /health` (liveness) and `GET /ready` (Mongo ping).
- **`sana-migrate`** creates/repairs indexes and seeds the admin user
  idempotently (`-indexes` / `-seed` / `-all`).

## Skills

| Skill | Trigger | File |
|---|---|---|
| `sana-add-endpoint` | Adding or editing an endpoint, new CRUD resource, new route | `apps/api/skills/sana-add-endpoint/SKILL.md` |
| `sana-aggregation-pipeline` | Mongo pipeline, aggregation, pagination, `$lookup`, slow list endpoint | `apps/api/skills/sana-aggregation-pipeline/SKILL.md` |
| `sana-auth-security` | Auth, JWT, login, refresh token, sessions, password, security review of a model/route | `apps/api/skills/sana-auth-security/SKILL.md` |