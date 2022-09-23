package utils

type TableType[T any] struct {
	total int64 `json:"total,omitempty" bson:"total"`
	docs  []T   `json:"docs,omitempty" bson:"docs"`
}
