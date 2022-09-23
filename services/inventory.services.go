package services

import (
	"context"
	"fmt"
	"go-sana-blackend/connections"
	"go-sana-blackend/models"
	"go-sana-blackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	//"go-sana-blackend/models"
)

var ProductCollection = connections.GetCollection("products", connections.IndexOptions{HasIndex: false})

func ListProducts(perPage int16, page int16) ([]bson.M, error) {
	var productsTable []bson.M
	ListPipeline := utils.GeneratePipelineFromJSON("./json/aggregations/listProducts.json")
	//fmt.Println(ListPipeline)
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
