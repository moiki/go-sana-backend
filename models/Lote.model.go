package models

import (
	"github.com/google/uuid"
	"time"
)

type Lote struct {
	LoteId     string       `json:"lote_id,omitempty" bson:"lote_id"`
	Number     int64        `json:"number,omitempty" bson:"number"`
	LoteDetail []LoteDetail `json:"lote_detail,omitempty" bson:"lote_detail"`
	CreatedAt  time.Time    `json:"created_at" bson:"created_at"`
}

type LoteDetail struct {
	ProductId  string  `json:"product_id,omitempty" bson:"product_id"`
	quantity   int64   `json:"quantity,omitempty" bson:"quantity"`
	totalPrice float64 `json:"total_price,omitempty" bson:"total_price"`
}

type Refund struct {
	RefundId  string    `json:"refund_id,omitempty" bson:"refund_id"`
	SaleId    string    `json:"sale_id,omitempty" bson:"sale_id"`
	Reason    string    `json:"reason,omitempty" bson:"reason"`
	CreatedAt time.Time `json:"created_at" bson:"created_at"`
}

func (l Lote) NewLote() Lote {
	l.LoteId = uuid.New().String()
	if l.CreatedAt.IsZero() {
		l.CreatedAt = time.Now()
	}
	return l
}
