package snippets

import (
	"fmt"
	"go-sana-blackend/connections"
	"go-sana-blackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

func SimpleTablePipeline(perPage int16, page int16, filter string) []bson.D {
	var matchOrCreate bson.M
	if filter != "" {
		matchOrCreate = bson.M{
			"$match": bson.M{
				"$text": bson.M{
					"$search": filter,
				},
			},
		}
	} else {
		matchOrCreate = bson.M{
			"$sort": bson.M{
				"created_at": -1,
			},
		}
	}
	pipe := []bson.M{
		matchOrCreate,
		{
			"$match": bson.M{
				"is_active": true,
			},
		},
		{
			"$facet": bson.M{
				"totalDocs": bson.A{
					bson.M{
						"$group": bson.M{
							"_id": nil,
							"count": bson.M{
								"$sum": 1,
							},
						},
					},
					bson.M{
						"$project": bson.M{
							"_id":   0,
							"count": 1,
						},
					},
				},
				"docs": bson.A{
					bson.M{
						"$skip": perPage * (page - 1),
					},
					bson.M{
						"$limit": perPage,
					},
					bson.M{
						"$project": bson.M{
							"_id": 0,
						},
					},
				},
			},
		},
		{
			"$unwind": "$totalDocs",
		},
		{
			"$project": bson.M{
				"total": "$totalDocs.count",
				"docs":  1,
			},
		},
	}
	if filter != "" {
		pipe = append(pipe)
	}
	result := utils.ParsePipeline(pipe)

	return result
}

func GetSimpleTableFromCollection(perPage int16, page int16, filter string, collection *mongo.Collection) ([]bson.M, error) {
	var collectionTable []bson.M
	pipeline := SimpleTablePipeline(perPage, page, filter)
	data, err := collection.Aggregate(connections.DbCtx, mongo.Pipeline(pipeline))
	if err != nil {
		fmt.Println("aggregate error: ", err)
		return collectionTable, err
	}
	if decodeError := data.All(connections.DbCtx, &collectionTable); decodeError != nil {
		fmt.Println("decodeError error: ", decodeError.Error())
		return collectionTable, decodeError
	}
	return collectionTable, nil
}
