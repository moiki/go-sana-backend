package models

import "time"

type Sale struct {
	SaleId        string
	InvoiceNumber int64
	Quantity      int64
	CreatedAt     time.Time
}

type SaleDetail struct {
	ProductId  string  `json:"product_id,omitempty" bson:"product_id"`
	quantity   int64   `json:"quantity,omitempty" bson:"quantity"`
	totalPrice float64 `json:"total_price,omitempty" bson:"total_price"`
}
