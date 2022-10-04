package models

import (
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

var SalesIndex = []mongo.IndexModel{
	{
		Keys:    bson.D{{"invoice_number", -1}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys:    bson.D{{"sale_id", -1}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys: bson.D{{"created_by", -1}},
	},
	{
		Keys: bson.D{{"created_at", -1}},
	},
}

type Sale struct {
	SaleId        string       `json:"sale_id,omitempty" validate:"required" bson:"sale_id"`
	InvoiceNumber int64        `json:"invoice_number,omitempty" bson:"invoice_number"`
	Amount        float64      `json:"amount,omitempty" bson:"amount"`
	Currency      string       `json:"currency,omitempty" bson:"currency"`
	Details       []SaleDetail `json:"details,omitempty" validate:"required" bson:"details"`
	CreatedAt     time.Time    `json:"created_at" bson:"createdAt"`
	CreatedBy     string       `json:"created_by,omitempty" bson:"createdBy"`
	description   string       `json:"description,omitempty" bson:"description"`
}

type SaleDetail struct {
	ProductId     string  `json:"product_id,omitempty" bson:"product_id"`
	InnerQuantity int64   `json:"inner_quantity,omitempty" bson:"inner_quantity"`
	SubTotal      float64 `json:"sub_total,omitempty" bson:"sub_total"`
	DiscountType  bool    `json:"discount_type,omitempty" bson:"discount_type"`
	Discount      float64 `json:"discount,omitempty" bson:"discount"`
}

func (l Sale) NewSale() Sale {
	l.SaleId = uuid.New().String()
	if l.CreatedAt.IsZero() {
		l.CreatedAt = time.Now()
	}
	if l.Currency == "" {
		l.Currency = "C$"
	}
	return l
}
