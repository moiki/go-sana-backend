package models

import (
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

var ProductIndex = []mongo.IndexModel{
	{
		Keys:    bson.D{{"nombre", "text"}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys:    bson.D{{"product_code", -1}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys: bson.D{{"created_at", -1}},
	},
}

type Product struct {
	ProductId    string    `json:"product_id,omitempty" bson:"product_id"`
	LaboratoryId string    `json:"laboratory_id,omitempty" bson:"laboratory_id"`
	Name         string    `json:"name,omitempty" bson:"name"`
	ProductCode  string    `json:"product_code,omitempty" bson:"product_code"`
	Price        float32   `json:"price,omitempty" bson:"price"`
	image        string    `json:"image,omitempty" bson:"image"`
	IsActive     bool      `json:"is_active,omitempty" bson:"is_active"`
	CreatedAt    time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" bson:"updated_at"`
}

func (p Product) NewProduct() Product {
	p.ProductId = uuid.New().String()
	if p.CreatedAt.IsZero() {
		p.CreatedAt = time.Now()
	}
	p.IsActive = true
	return p
}
