package models

import (
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/x/bsonx"
	"time"
)

var ProductPresentationIndex = []mongo.IndexModel{
	{
		Keys:    bsonx.Doc{{Key: "name", Value: bsonx.String("text")}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys: bson.D{{"created_at", -1}},
	},
}

type ProductPresentation struct {
	ProductPresentationId string    `json:"product_presentation_id,omitempty" validate:"required" bson:"product_presentation_id"`
	Name                  string    `json:"name,omitempty" validate:"required" bson:"name"`
	Description           string    `json:"description,omitempty" bson:"description"`
	IsActive              bool      `json:"is_active,omitempty" validate:"required" bson:"is_active"`
	CreatedAt             time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt             time.Time `json:"updated_at" bson:"updated_at"`
}

func (p ProductPresentation) NewProductPresentation() ProductPresentation {
	p.ProductPresentationId = uuid.New().String()
	if p.CreatedAt.IsZero() {
		p.CreatedAt = time.Now()
	}
	p.IsActive = true
	return p
}
