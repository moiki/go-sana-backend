package models

import (
	"github.com/google/uuid"
	"time"
)

type ProductPresentation struct {
	ProductPresentationId string    `json:"product_presentation_id,omitempty" bson:"product_presentation_id"`
	Name                  string    `json:"name,omitempty" bson:"name"`
	Description           string    `json:"description,omitempty" bson:"description"`
	IsActive              bool      `json:"is_active,omitempty" bson:"is_active"`
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
