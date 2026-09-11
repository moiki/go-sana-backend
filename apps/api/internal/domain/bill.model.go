package models

import (
	"github.com/google/uuid"
	"time"
)

type Bill struct {
	BillId     string       `json:"bill_id,omitempty" bson:"bill_id"`
	Number     int64        `json:"number,omitempty" bson:"number"`
	BillDetail []BillDetail `json:"bill_detail,omitempty" bson:"bill_detail"`
	CreatedAt  time.Time    `json:"created_at" bson:"created_at"`
	SaleDate   time.Time    `json:"sale_date" bson:"sale_date"`
}

type BillDetail struct {
	ProductId  string    `json:"product_id,omitempty" bson:"product_id"`
	Quantity   int64     `json:"quantity,omitempty" bson:"quantity"`
	TotalPrice float64   `json:"total_price,omitempty" bson:"total_price"`
	CreatedAt  time.Time `json:"created_at" bson:"created_at"`
}

func (l Bill) NewBill() Bill {
	l.BillId = uuid.New().String()
	if l.CreatedAt.IsZero() {
		l.CreatedAt = time.Now()
	}
	if l.SaleDate.IsZero() {
		l.SaleDate = time.Now()
	}
	return l
}
