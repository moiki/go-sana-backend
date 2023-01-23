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
var ProductPresentationCollection = connections.GetCollection("snProductPresentations", connections.IndexOptions{HasIndex: true, Indexes: models.ProductPresentationIndex})

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
						"$lookup": bson.M{
							"from": "snProductPresentations",
							"as":   "presentation",
							"let": bson.M{
								"presentation_id": "$product_presentation_id",
							},
							"pipeline": bson.A{
								bson.M{
									"$match": bson.M{
										"$expr": bson.M{
											"$and": bson.A{
												bson.M{
													"$eq": bson.A{
														"$product_presentation_id",
														"$$presentation_id",
													},
												},
												bson.M{
													"$eq": bson.A{
														"$is_active",
														true,
													},
												},
											},
										},
									},
								},
								bson.M{
									"$project": bson.M{
										"_id":  0,
										"name": 1,
									},
								},
							},
						},
					},
					bson.M{
						"$unwind": bson.M{
							"path":                       "$presentation",
							"preserveNullAndEmptyArrays": true,
						},
					},
					bson.M{
						"$addFields": bson.M{
							"presentation": "$presentation.name",
						},
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
	validationError := utils.ModelValidation.Struct(product)
	if validationError != nil {
		return validationError
	}
	_, err := ProductCollection.InsertOne(connections.DbCtx, product)
	if err != nil {
		return err
	}
	return nil
}

func GetProductByNameOrCode(value string) ([]bson.M, error) {
	var result []bson.M
	search := bson.M{
		"$or": bson.A{
			bson.M{
				"product_code": bson.M{
					"$eq": value,
				},
			},
			bson.M{
				"$text": bson.M{
					"$search": value,
				},
			},
		},
	}
	//fmt.Println(search)
	data, err := ProductCollection.Find(connections.DbCtx, search) //.Decode(&result)
	if err != nil {
		return result, err
	}
	errDecode := data.All(connections.DbCtx, &result)
	if errDecode != nil {
		return nil, errDecode
	}
	fmt.Println(result)
	return result, nil
}

func ListProductPresentationForSelect() ([]models.ProductPresentation, error) {
	var result []models.ProductPresentation

	data, err := ProductPresentationCollection.Find(connections.DbCtx, bson.M{"is_active": true})
	if err != nil {
		return result, err
	}
	if decodeError := data.All(connections.DbCtx, &result); decodeError != nil {
		fmt.Println("Provider decodeError error: ", decodeError.Error())
		return result, decodeError
	}
	return result, nil
}

func CreateProductPresentation(presentation models.ProductPresentation) error {
	validationError := utils.ModelValidation.Struct(presentation)
	if validationError != nil {
		return validationError
	}
	_, err := ProductPresentationCollection.InsertOne(connections.DbCtx, presentation)
	if err != nil {
		return err
	}
	return nil
}
