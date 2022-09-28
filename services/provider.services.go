package services

import (
	"fmt"
	"go-sana-blackend/connections"
	"go-sana-blackend/models"
	"go-sana-blackend/utils"
	"go.mongodb.org/mongo-driver/bson"
)

var ProviderCollection = connections.GetCollection("snProviders", connections.IndexOptions{HasIndex: true, Indexes: models.ProviderIndex})

func ListProviders() ([]models.Provider, error) {
	var result []models.Provider

	data, err := ProviderCollection.Find(connections.DbCtx, bson.M{"is_active": true})
	if err != nil {
		return result, err
	}
	if decodeError := data.All(connections.DbCtx, &result); decodeError != nil {
		fmt.Println("Provider decodeError error: ", decodeError.Error())
		return result, decodeError
	}
	return result, nil
}

func CreateProvider(provider models.Provider) error {
	validationError := utils.ModelValidation.Struct(provider)
	if validationError != nil {
		return validationError
	}
	_, err := ProviderCollection.InsertOne(connections.DbCtx, provider)
	if err != nil {
		return err
	}
	return nil
}
