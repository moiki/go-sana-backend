package models

import (
	"github.com/google/uuid"
	"time"
)

type Session struct {
	SessionId    string `json:"session_id,omitempty" bson:"session_id,omitempty"`
	UserEmail    string `json:"user_email,omitempty" bson:"user_email,omitempty"`
	ClientIp     string `json:"client_ip" bson:"client_ip,omitempty"`
	RefreshToken string `json:"refresh_token" bson:"refresh_token"`
	IsBlocked    bool   `json:"is_blocked" bson:"is_blocked,omitempty"`
	ExpiresAt    int64  `json:"expires_at" bson:"expires_at,omitempty"`
	CreatedAt    int64  `json:"created_at" bson:"created_at,omitempty"`
}

func (s *Session) NewSession() *Session {
	s.SessionId = uuid.New().String()
	s.CreatedAt = time.Now().Unix()
	s.IsBlocked = false
	return s
}
