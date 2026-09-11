package models

import (
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"time"
)

var SessionIndex = []mongo.IndexModel{
	{Keys: bson.D{{Key: "refresh_token", Value: 1}}, Options: options.Index().SetUnique(true)},
	{Keys: bson.D{{Key: "user_email", Value: 1}}},
	{Keys: bson.D{{Key: "created_at", Value: -1}}},
}

type Session struct {
	SessionId     string `json:"session_id,omitempty" bson:"session_id"`
	UserId        string `json:"user_id,omitempty" bson:"user_id,omitempty"`
	UserEmail     string `json:"user_email,omitempty" bson:"user_email"`
	ClientIp      string `json:"client_ip" bson:"client_ip,omitempty"`
	UserAgent     string `json:"user_agent" bson:"user_agent,omitempty"`
	RefreshToken  string `json:"-" bson:"refresh_token"`
	RememberMe    bool   `json:"remember_me" bson:"remember_me"`
	IsBlocked     bool   `json:"is_blocked" bson:"is_blocked"`
	BlockedReason string `json:"blocked_reason,omitempty" bson:"blocked_reason,omitempty"`
	RefreshCount  int    `json:"refresh_count" bson:"refresh_count"`
	ExpiresAt     int64  `json:"expires_at" bson:"expires_at"`
	LastUsedAt    int64  `json:"last_used_at,omitempty" bson:"last_used_at,omitempty"`
	CreatedAt     int64  `json:"created_at" bson:"created_at"`
}

func (s *Session) NewSession() *Session {
	s.SessionId = uuid.New().String()
	s.CreatedAt = time.Now().Unix()
	s.IsBlocked = false
	s.RefreshCount = 0
	return s
}
