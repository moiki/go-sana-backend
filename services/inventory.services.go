package services

import (
	"context"
	"fmt"
	"go-sana-blackend/connections"
	"go-sana-blackend/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	//"go-sana-blackend/models"
)

var ProductCollection = connections.GetCollection("products", connections.IndexOptions{HasIndex: false})

func ListProductPipeline(perPage int16, page int16) []bson.D {
	var result []bson.D

	pipe := []bson.M{
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
	for _, stage := range pipe {
		var convertedStage bson.D
		newStage, err := bson.Marshal(stage)
		if err != nil {
			println("IN MARSHAL")
			panic(err.Error())
		}
		if bsonErr := bson.Unmarshal(newStage, &convertedStage); bsonErr != nil {
			println("IN UN-MARSHAL")
			panic(bsonErr.Error())
		}
		result = append(result, convertedStage)
	}

	return result
}

func ListProducts(perPage int16, page int16) ([]bson.M, error) {
	var productsTable []bson.M

	ListPipeline := ListProductPipeline(perPage, page)
	fmt.Println(ListPipeline)
	data, err := ProductCollection.Aggregate(connections.DbCtx, mongo.Pipeline(ListPipeline))
	if err != nil {
		fmt.Println("aggregate error: ", err)
		return productsTable, err
	}
	if decodeError := data.All(context.TODO(), &productsTable); decodeError != nil {
		fmt.Println("decodeError error: ", decodeError.Error())
		return productsTable, decodeError
	}

	return productsTable, nil
}

func CreateProduct(product models.Product) error {
	_, err := ProductCollection.InsertOne(connections.DbCtx, product)
	if err != nil {
		return err
	}
	return nil
}
