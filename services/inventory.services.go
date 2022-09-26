package services

import (
	"fmt"
	"go-sana-blackend/connections"
	"go-sana-blackend/models"
	"go-sana-blackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	//"go-sana-blackend/models"
)

var ProductCollection = connections.GetCollection("snProducts", connections.IndexOptions{HasIndex: true, Indexes: models.ProductIndex})

func ListProductPipeline(perPage int16, page int16, filter string) []bson.D {
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

func ListProducts(perPage int16, page int16, filter string) ([]bson.M, error) {
	var productsTable []bson.M

	ListPipeline := ListProductPipeline(perPage, page, filter)
	//fmt.Println(ListPipeline)
	data, err := ProductCollection.Aggregate(connections.DbCtx, mongo.Pipeline(ListPipeline))
	if err != nil {
		fmt.Println("aggregate error: ", err)
		return productsTable, err
	}
	if decodeError := data.All(connections.DbCtx, &productsTable); decodeError != nil {
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
