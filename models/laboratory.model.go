package models

import (
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

var LaboratoryIndex = []mongo.IndexModel{
	{
		Keys: bson.D{{"name", "text"}},
	},
	{
		Keys:    bson.D{{"laboratory_id", -1}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys: bson.D{{"auth_code", "text"}},
	},
	{
		Keys: bson.D{{"created_at", -1}},
	},
}

type Provider struct {
	ProviderId   string    `json:"laboratory_id,omitempty" bson:"laboratory_id"`
	Name         string    `json:"name,omitempty" bson:"name"`
	Direction    string    `json:"direction,omitempty" bson:"direction"`
	Telephone    string    `json:"telephone,omitempty" bson:"telephone"`
	AuthCode     string    `json:"auth_code,omitempty" bson:"auth_code"`
	BrandImage   string    `json:"brand_image,omitempty" bson:"brand_image"`
	ProviderType string    `json:"provider_type,omitempty" bson:"provider_type"`
	IsActive     bool      `json:"is_active,omitempty" bson:"is_active"`
	CreatedAt    time.Time `json:"created_at" bson:"created_at"`
	UpdatedAt    time.Time `json:"updated_at" bson:"updated_at"`
}

func (l Provider) NewProvider() Provider {
	l.ProviderId = uuid.New().String()
	if l.CreatedAt.IsZero() {
		l.CreatedAt = time.Now()
	}
	l.IsActive = true
	return l
}
