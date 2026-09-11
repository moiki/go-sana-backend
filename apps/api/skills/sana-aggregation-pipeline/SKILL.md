---
name: sana-aggregation-pipeline
description: >
  Write MongoDB aggregation pipelines the Sana way: ordered bson.M stages with
  utils.ParsePipeline, single-query $facet pagination, $lookup joins and text
  search without reordering pitfalls.
  Trigger: Mongo pipeline, aggregation, pagination, $facet, $lookup, slow list
  endpoint, "agregación", "pipeline de mongo".
license: Apache-2.0
metadata:
  author: gentleman-programming
  version: "1.0"
---

## When to Use

Use this skill when:
- Building or editing an aggregation pipeline in `services/`
- Adding pagination (`total` + `docs`) to a list endpoint
- Joining collections with `$lookup`
- Debugging a slow list endpoint that scans too many docs
- The phrase "$text", "$facet", "$skip", "agregación" appears in the task

## Critical Patterns

- **Write stages as `[]bson.M` and convert with `utils.ParsePipeline(pipe)`** returning `[]bson.D`.
  Never marshal/unmarshal stages by hand: `bson.M` (a map) does NOT guarantee key
  order, and `$skip`, `$facet`, and `$lookup` are order-sensitive.
  `ParsePipeline` lives in `utils/aggregations.utils.go:42`.
- **Use one `$facet` for pagination** so count + page run in a single round trip:
  one branch counts (`$group` + `$sum: 1`), the other does `$skip`/`$limit`.
- **Table result contract**: `{ total, docs }` (see `ListProducts`).
- **Execute with the shared client + `connections.DbCtx`**:
  `ProductCollection.Aggregate(DbCtx, mongo.Pipeline(pipeline))` then `data.All(DbCtx, &out)`.
- **`$text` search requires a text index** — `ProductIndex` has `{name: "text"}` and
  `UserIndex` has `{email: "text"}`. Adding text search on a new field means adding
  a text index too.
- **Round `$facet` result back up with `$unwind` + `$project`** so the JSON is
  flat (`total`, `docs`) instead of nested `{ totalDocs: [...] }`.

## Reference Implementation

This is the canonical shape to copy (`services/inventory.services.go:18`):

```go
func ListProductPipeline(perPage int16, page int16, filter string) []bson.D {
	var firstStage bson.M
	if filter != "" {
		firstStage = bson.M{"$match": bson.M{"$text": bson.M{"$search": filter}}}
	} else {
		firstStage = bson.M{"$sort": bson.M{"created_at": -1}}
	}
	pipe := []bson.M{
		firstStage,
		{"$match": bson.M{"is_active": true}},
		{"$facet": bson.M{
			"totalDocs": bson.A{
				bson.M{"$group": bson.M{"_id": nil, "count": bson.M{"$sum": 1}}},
				bson.M{"$project": bson.M{"_id": 0, "count": 1}},
			},
			"docs": bson.A{
				bson.M{"$skip": perPage * (page - 1)},
				bson.M{"$limit": perPage},
				// optional $lookup lives here, inside the paginated branch
			},
		}},
		{"$unwind": "$totalDocs"},
		{"$project": bson.M{"total": "$totalDocs.count", "docs": 1}},
	}
	return utils.ParsePipeline(pipe)
}
```

## $lookup with $expr (join on a string id)

Follow the existing pattern in `ListProductPipeline` (`snProducts` -> `snProductPresentations`):

```go
bson.M{"$lookup": bson.M{
	"from": "snProductPresentations",
	"as":   "presentation",
	"let":  bson.M{"presentation_id": "$product_presentation_id"},
	"pipeline": bson.A{
		bson.M{"$match": bson.M{"$expr": bson.M{"$and": bson.A{
			bson.M{"$eq": bson.A{"$product_presentation_id", "$$presentation_id"}},
			bson.M{"$eq": bson.A{"$is_active", true}},
		}}}},
		bson.M{"$project": bson.M{"_id": 0, "name": 1}},
	},
}},
bson.M{"$unwind": bson.M{"path": "$presentation", "preserveNullAndEmptyArrays": true}},
bson.M{"$addFields": bson.M{"presentation": "$presentation.name"}},
```

- **Why `$expr` + `let`/`$$`?** Because the join key is a string field, not an
  ObjectId — `$expr` matches on the string equality directly.
- **`preserveNullAndEmptyArrays: true`** keeps products that have no presentation.

## Do / Don't

- DO put `$lookup`/`$unwind` INSIDE the `docs` facet branch, not on the whole
  collection — otherwise you paginate AFTER the join and counts explode.
- DO `$match` early (`is_active`, text search) before `$facet`.
- DON'T edit `json/aggregations/*.json` to change behavior — live routes use the Go
  pipelines. Those JSON files only feed the unused `GeneratePipelineFromJSON`.
- DON'T compute `perPage * (page - 1)` in `int16` with unbounded inputs — clamp
  `page`/`per_page` in the handler (see `TableParams` in `routes/inventory.routes.go:11`).
- DON'T hand-marshal stages (`bson.Marshal` + `bson.Unmarshal` per stage) — use `ParsePipeline`.

## Commands

```bash
go build ./... && go vet ./...
go run .                             # smoke test the endpoint
# Inspect a pipeline via the /api/v1/inventory/products-table endpoint
```

## Resources

- **Canonical pipeline**: `services/inventory.services.go:18` `ListProductPipeline`.
- **Parser**: `utils/aggregations.utils.go:42` `ParsePipeline`.
- **Table params guard**: `routes/inventory.routes.go:11`.
- **Join source data**: `models/productPresentation.model.go`.