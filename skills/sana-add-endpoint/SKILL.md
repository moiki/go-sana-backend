---
name: sana-add-endpoint
description: >
  Add a new API endpoint to the Sana drugstore backend (Go + Fiber + MongoDB)
  following the layered models -> services -> routes conventions.
  Trigger: adding an endpoint, new route, new CRUD resource, editing an existing
  endpoint, "agregar endpoint", "nueva ruta", "crear endpoint".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Use this skill when:
- Adding a new HTTP endpoint or CRUD resource to the API
- Editing an existing handler / route registration
- Wiring a new MongoDB collection behind an endpoint
- Asked to "expose", "add", or "crear un endpoint" for a domain model

If the endpoint involves a Mongo aggregation pipeline, also load
`sana-aggregation-pipeline`. If it touches auth or security, also load
`sana-auth-security`.

## Critical Patterns

Every endpoint follows the same 4-layer path:

```
models/   (shape + defaults + indexes)
services/ (business logic + DB query, owns the collection)
routes/   (handler + route registration)
middlewares/ (JWT gate, unless public)
```

- **Collection names** are prefixed `sn` and opened via the shared client:
  `connections.GetCollection("snX", connections.IndexOptions{HasIndex: true, Indexes: models.XIndex})`.
  Never call `mongo.Connect` yourself.
- **Never persist unexported fields.** Every struct field must be EXPORTED with an
  explicit `bson:"..."` tag — the driver silently drops anything else.
- **Every model needs a `NewX()` constructor** that stamps `uuid.New()` + `CreatedAt`
  and sensible defaults. Call it BEFORE `ctx.BodyParser` so the request body wins.
- **Protect everything except login**: wrap the handler in
  `middlewares.JWTProtected()` when registering the route.
- **Error contract**: services return `(result, error)`; handlers reply
  `ctx.Status(NNN).JSON(&fiber.Map{"error": err.Error()})`.
- **Verify**: `go build ./...` and `gofmt -w` before finishing.

## Workflow

### 1. Model — `models/<name>.model.go`

Anonymous `int`/`struct` literals go in the constructor so write path is unambiguous:

```go
var ProductIndex = []mongo.IndexModel{
	{Keys: bson.D{{"name", "text"}}},
	{Keys: bson.D{{"product_code", -1}}, Options: options.Index().SetUnique(true)},
	{Keys: bson.D{{"created_at", -1}}},
}

type Product struct {
	ProductId string    `json:"product_id,omitempty" validate:"required" bson:"product_id"`
	Name      string    `json:"name,omitempty" validate:"required" bson:"name"`
	IsActive  bool      `json:"is_active,omitempty" bson:"is_active"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

func (p Product) NewProduct() Product {
	p.ProductId = uuid.New().String()
	p.CreatedAt = time.Now()
	p.IsActive = true
	return p
}
```

Add an index block only for a NEW collection. Reuse the existing model index for
existing collections.

### 2. Service — `services/<domain>.services.go`

```go
var ProductCollection = connections.GetCollection("snProducts",
	connections.IndexOptions{HasIndex: true, Indexes: models.ProductIndex})

func CreateProduct(product models.Product) error {
	if err := utils.ModelValidation.Struct(product); err != nil {
		return err
	}
	_, err := ProductCollection.InsertOne(connections.DbCtx, product)
	return err
}
```

### 3. Handler + route — `routes/<domain>.routes.go`

```go
func CreateProduct(ctx *fiber.Ctx) error {
	newProduct := models.Product{}.NewProduct()
	if err := ctx.BodyParser(&newProduct); err != nil {
		return ctx.Status(400).JSON(&fiber.Map{"error": err.Error()})
	}
	if err := services.CreateProduct(newProduct); err != nil {
		return ctx.Status(400).JSON(&fiber.Map{"error": err.Error()})
	}
	return ctx.JSON(&fiber.Map{"message": "Product Created Successfully!"})
}

func DomainRoutes(app fiber.Router) {
	app.Post("/products", middlewares.JWTProtected(), CreateProduct)
}
```

Mount the router in `server.go` the way `routes.AuthRoutes(api)` / `routes.InventoryRoutes(api)` do.

### 4. Query params (table endpoints)

Bind params with a struct + `ctx.QueryParser` instead of parsing by hand:

```go
type TableParams struct {
	PerPage int16  `query:"per_page,omitempty"`
	Page    int16  `query:"page,omitempty"`
	Filter  string `query:"filter,omitempty"`
}
```

Clamp `per_page`/`page` before computing `perPage*(page-1)` (int16 arithmetic overflows).

## Commands

```bash
go build ./...              # compile check
gofmt -w models/ services/ routes/   # format (never format tmp/)
go vet ./...                # static analysis
go run .                    # serve and smoke-test the endpoint
```

## Resources

- **Pattern to copy**: `routes/inventory.routes.go:178` (`CreateProduct`) and
  `services/inventory.services.go:159`.
- **Full read path with pagination**: `routes/inventory.routes.go:134` + `services/inventory.services.go:141`.
- **Table params**: `routes/inventory.routes.go:11` (`TableParams`).
- **List helper**: `services/auth.services.go` (`collection` + `Me`) for a find-one-by-email reference.