# AGENTS.md — Sana Backend

Backend for a drugstore point-of-sale ("Sana"). Go 1.18, Fiber v2, MongoDB, JWT auth.

## Commands

```bash
go build ./...   # compile check
go vet ./...     # static analysis
gofmt -l .       # list unformatted files (ignore the tmp/ dir)
go run .         # start server on http://localhost:9000 (needs MongoDB + .env)
```

There is no test framework configured and no tests exist. Do not invent a test
setup without asking the user first.

## Runtime requirements

- MongoDB reachable at `MONGO_URI`, using database `MONGO_DB`.
- A `.env` file (see `.env.example` for all keys). `.env` is gitignored — never commit it.
- On first startup `connections.DefaultUser` seeds the admin account from
  `DEF_USER` / `DEF_PASS`. The default login is `DEF_USER` + the `DEF_PASS` value
  in `.env`.

## Architecture (request flow)

```
HTTP -> routes/ (Fiber handlers) -> services/ (business logic + DB) -> connections/ (shared Mongo client) -> MongoDB
                                     |
                              domain shapes in models/
```

| Layer | Responsibility | Examples |
|---|---|---|
| `routes/` | Bind URL → handler; parse body/query; return JSON | `routes/auth.routes.go`, `routes/inventory.routes.go` |
| `services/` | Queries, aggregation pipelines, business rules; own package-level collections | `ListProducts`, `RefreshToken`, `CreateProduct` |
| `connections/db.go` | Shared Mongo client (`Connect`), `GetCollection`, index helper | `GetCollection("snProducts", connections.IndexOptions{...})` |
| `models/` | Structs + bson/json tags, index definitions, `NewX()` constructors | `Product`, `NewProduct()` |
| `utils/` | Env config, JWT, pipeline parsing, validation | `EnvData`, `ParsePipeline`, `ModelValidation` |

The module import path is `go-sana-blackend` (deliberate typo in `go.mod`). Do not rename it.

## Conventions (must follow)

- **Collection names** are prefixed `sn`: `snUsers`, `snProducts`, `snProductPresentations`,
  `snProviders`, `snLaboratories`, `snSales`, `snSessions`. Get them once via
  `connections.GetCollection(name, connections.IndexOptions{HasIndex: true, Indexes: models.<X>Index})`.
  Never open your own `mongo.Connect` — reuse the shared client.
- **Every persisted struct**: all fields EXPORTED, every field tagged with explicit
  `bson:"..."`. The Mongo driver silently drops unexported fields (verified at runtime).
- **Every model has a `NewX()` constructor** that stamps `uuid.New()` + `CreatedAt`
  plus sensible defaults. Call it BEFORE `ctx.BodyParser` so the incoming body
  overwrites defaults.
- **Passwords** are bcrypt hashes via `User.HashPassword` / `User.CheckPassword`. Never store plaintext.
- **Secret fields** (`Password`, `RefreshToken`) carry `json:"-"`; `GET /me` returns the raw user struct, so anything without that tag leaks.
- **JWT secrets** come from env `JWT_SECRET` / `JWT_REFRESH_SECRET`. When adding a new
  env var, also add it to `.env.example` with the same name.
- **Aggregation pipelines**: write stages as `[]bson.M`, then convert with
  `utils.ParsePipeline`. Maps reorder keys and `$skip`/`$facet` are order-sensitive —
  never marshal stages by hand.
- **Protected endpoints** wrap handlers with `middlewares.JWTProtected()`. After it runs,
  the parsed JWT is at `ctx.Locals("user")` (a `*jwt.Token`).
- **Validation**: `utils.ModelValidation.Struct(x)` using `validate:"..."` tags
  (go-playground/validator v9).
- **Errors**: services return `error`; handlers respond
  `ctx.Status(NNN).JSON(&fiber.Map{"error": ...})`.
- **Responses**: use `fiber.Map` for JSON bodies.

## Adding an endpoint

Follow the `sana-add-endpoint` skill for the full walkthrough:

1. Model (`models/`): struct + `NewX()` + index block when a new collection is needed.
2. Service (`services/`): package-level collection + a function that returns `(result, error)`.
3. Handler + route registration (`routes/`).
4. `middlewares.JWTProtected()` unless the route is public (only `/login` is public today).
5. Verify with `go build ./...` and `gofmt -w <files>`.

## Gotchas

- **Token times**: access token 24h, refresh token 120h. The refresh flow ROTATES the
  refresh token and rejects blocked sessions — it must never echo the old token back.
- **Table routes** read `per_page`, `page`, `filter` via `TableParams` + `ctx.QueryParser`
  (defaults: per_page 10, page 1). `ListProducts` returns a `$facet` result
  `{ total, docs }`.
- **JSON pipelines** under `json/aggregations/` feed `utils.GeneratePipelineFromJSON`,
  but live routes use the Go pipelines built with `utils.ParsePipeline`.
  To change behavior, edit the Go pipelines, not the JSON files.
- **Beware int16 pagination math**: `perPage * (page - 1)` is int16 arithmetic; clamp
  inputs to sensible ranges to avoid overflow.

## Skills

| Skill | Trigger | File |
|---|---|---|
| `sana-add-endpoint` | Adding or editing an endpoint, new CRUD resource, new route | `skills/sana-add-endpoint/SKILL.md` |
| `sana-aggregation-pipeline` | Mongo pipeline, aggregation, pagination, `$lookup`, slow list endpoint | `skills/sana-aggregation-pipeline/SKILL.md` |
| `sana-auth-security` | Auth, JWT, login, refresh token, sessions, password, security review of a model/route | `skills/sana-auth-security/SKILL.md` |