package models

import (
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

var ProviderIndex = []mongo.IndexModel{
	{
		Keys:    bson.D{{"name", "text"}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys:    bson.D{{"provider_id", -1}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys: bson.D{{"created_at", -1}},
	},
}

type Provider struct {
	ProviderId string    `json:"provider_id,omitempty" validate:"required" bson:"provider_id"`
	Name       string    `json:"name,omitempty" validate:"required" bson:"name"`
	Direction  string    `json:"direction,omitempty" validate:"required" bson:"direction"`
	Telephone  string    `json:"telephone,omitempty" validate:"required" bson:"telephone"`
	AuthCode   string    `json:"auth_code,omitempty" validate:"required" bson:"auth_code"`
	BrandImage string    `json:"brand_image,omitempty" bson:"brand_image"`
	IsActive   bool      `json:"is_active,omitempty" validate:"required" bson:"is_active"`
	CreatedAt  time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" bson:"updated_at"`
}

func (l Provider) NewProvider() Provider {
	l.ProviderId = uuid.New().String()
	if l.CreatedAt.IsZero() {
		l.CreatedAt = time.Now()
	}
	l.IsActive = true
	return l
}
