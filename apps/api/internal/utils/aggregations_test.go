package utils

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/require"
	"go.mongodb.org/mongo-driver/bson"
)

func TestParsePipelinePreservesStageOrder(t *testing.T) {
	pipe := []bson.M{
		{"$match": bson.M{"is_active": true}},
		{"$skip": 10},
		{"$facet": bson.M{"total": bson.A{bson.M{"$count": "count"}}}},
		{"$limit": 5},
	}

	stages := ParsePipeline(pipe)

	var names []string
	for _, stage := range stages {
		require.Equal(t, 1, len(stage))
		names = append(names, stage[0].Key)
	}
	require.Equal(t, []string{"$match", "$skip", "$facet", "$limit"}, names,
		"order-sensitive stages must survive marshal/unmarshal")
}

func TestParsePipelineKeepsNestedDoc(t *testing.T) {
	pipe := []bson.M{
		{"$project": bson.M{"name": 1, "price": "$presentations.price"}},
	}
	stages := ParsePipeline(pipe)
	require.Len(t, stages[0], 1)
	fmt.Sprint(stages[0][0].Value)
}
