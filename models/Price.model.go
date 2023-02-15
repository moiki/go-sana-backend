package models

import (
	"time"
)

type Price struct {
	IdPrice     string    `json:"id_price,omitempty" bson:"id_price"`
	IdProduct   string    `json:"id_product,omitempty" bson:"id_product"`
	Type        string    `bson:"type" json:"type,omitempty"`
	Quantity    int16     `bson:"quantity" json:"quantity"`
	Amount      float64   `bson:"amount" json:"amount,omitempty"`
	Description string    `bson:"description" json:"description,omitempty"`
	IsActive    bool      `json:"is_active" bson:"is_active"`
	CreatedAt   time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" bson:"updated_at"`
}
