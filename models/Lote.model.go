package models

import (
	"github.com/google/uuid"
	"time"
)

type Lot struct {
	LotId        string      `json:"lot_id,omitempty" bson:"lot_id"`
	Number       int64       `json:"number,omitempty" bson:"number"`
	LotDetail    []LotDetail `json:"lot_detail,omitempty" bson:"lot_detail"`
	CreatedAt    time.Time   `json:"created_at" bson:"created_at"`
	PurchaseDate time.Time   `json:"purchase_date" bson:"purchase_date"`
}

type LotDetail struct {
	ProductId  string    `json:"product_id,omitempty" bson:"product_id"`
	Quantity   int64     `json:"quantity,omitempty" bson:"quantity"`
	TotalPrice float64   `json:"total_price,omitempty" bson:"total_price"`
	CreatedAt  time.Time `json:"created_at" bson:"created_at"`
}

type Refund struct {
	RefundId  string    `json:"refund_id,omitempty" bson:"refund_id"`
	SaleId    string    `json:"sale_id,omitempty" bson:"sale_id"`
	Reason    string    `json:"reason,omitempty" bson:"reason"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

func (l Lot) NewLot() Lot {
	l.LotId = uuid.New().String()
	if l.CreatedAt.IsZero() {
		l.CreatedAt = time.Now()
	}
	if l.PurchaseDate.IsZero() {
		l.PurchaseDate = time.Now()
	}
	return l
}
