package services

import (
	"fmt"
	"go-sana-blackend/connections"
	"go-sana-blackend/models"
	"go-sana-blackend/utils"
	"go-sana-blackend/utils/snippets"
	"go.mongodb.org/mongo-driver/bson"
)

var LabCollection = connections.GetCollection("snLaboratories", connections.IndexOptions{HasIndex: true, Indexes: models.LaboratoryIndex})

func ListLabsForTable(perPage int16, page int16, filter string) ([]bson.M, error) {
	return snippets.GetSimpleTableFromCollection(perPage, page, filter, LabCollection)
}

func ListLabsForSelect() ([]models.Laboratory, error) {
	var result []models.Laboratory

	data, err := LabCollection.Find(connections.DbCtx, bson.M{"is_active": true})
	if err != nil {
		return result, err
	}
	if decodeError := data.All(connections.DbCtx, &result); decodeError != nil {
		fmt.Println("Lab decodeError error: ", decodeError.Error())
		return result, decodeError
	}
	return result, nil
}

func CreateLab(lab models.Laboratory) error {
	validationError := utils.ModelValidation.Struct(lab)
	if validationError != nil {
		return validationError
	}
	_, err := LabCollection.InsertOne(connections.DbCtx, lab)
	if err != nil {
		return err
	}
	return nil
}
