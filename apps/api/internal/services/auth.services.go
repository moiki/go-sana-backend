package services

import (
	"errors"
	"fmt"
	"github.com/moiki/sana/api/internal/domain"
	"github.com/moiki/sana/api/internal/store"
	"github.com/moiki/sana/api/internal/utils"
	"go.mongodb.org/mongo-driver/bson"
	"time"
)

const (
	SessionTTLRememberMe = 30 * 24 * time.Hour
	SessionTTLDefault    = 24 * time.Hour
)

var collection = connections.GetCollection("snUsers", connections.IndexOptions{HasIndex: true, Indexes: models.UserIndex})
var sessionCollection = connections.GetCollection("snSessions", connections.IndexOptions{HasIndex: true, Indexes: models.SessionIndex})

type Credentials struct {
	Email      string `json:"email,omitempty"`
	Password   string `json:"password,omitempty"`
	RememberMe bool   `json:"remember_me,omitempty"`
}

func sessionTTL(rememberMe bool) time.Duration {
	if rememberMe {
		return SessionTTLRememberMe
	}
	return SessionTTLDefault
}

func Login(data Credentials, ip string, userAgent string) (string, string, bool, error) {
	var user models.User
	errFind := collection.FindOne(connections.DbCtx, bson.M{"email": data.Email}).Decode(&user)
	if errFind != nil {
		return "", "", false, errFind
	}
	if err := user.CheckPassword(data.Password); err != nil {
		fmt.Println("error in check pass ", err.Error())
		return "", "", false, err
	}
	token, err := utils.GenerateJWT(user.Email, user.FirstName, user.LastName, user.UserId, user.UserType)
	if err != nil {
		fmt.Println("error in token ", err.Error())
		return "", "", false, err
	}
	ttl := sessionTTL(data.RememberMe)
	refreshTk, err := utils.GenerateRefreshJWT(user.Email, ttl)
	if err != nil {
		fmt.Println("error in refresh ", err.Error())
		return "", "", false, err
	}
	// generate audit session record
	now := time.Now()
	session := (&models.Session{}).NewSession()
	session.UserId = user.UserId
	session.UserEmail = user.Email
	session.ClientIp = ip
	session.UserAgent = userAgent
	session.RefreshToken = refreshTk
	session.RememberMe = data.RememberMe
	session.ExpiresAt = now.Add(ttl).Unix()
	if err := connections.InsertOne(session, sessionCollection); err != nil {
		fmt.Println("error in session ", err.Error())
		return "", "", false, err
	}
	return token, refreshTk, data.RememberMe, nil
}

func Me(email string) (models.User, error) {
	return connections.FindOneByEmail(email, collection)
}

func RefreshToken(refreshToken string) (string, string, bool, error) {
	if err := utils.ValidateRefreshToken(refreshToken); err != nil {
		return "", "", false, err
	}
	email, err := utils.ExtractEmailFromRefreshToken(refreshToken)
	if err != nil {
		return "", "", false, err
	}
	var session models.Session
	err = sessionCollection.FindOne(
		connections.DbCtx,
		bson.M{"refresh_token": refreshToken, "is_blocked": false},
	).Decode(&session)
	if err != nil {
		return "", "", false, err
	}
	if time.Now().Unix() >= session.ExpiresAt {
		blockReason := "expired"
		sessionCollection.UpdateOne(connections.DbCtx, bson.M{"refresh_token": refreshToken},
			bson.M{"$set": bson.M{"is_blocked": true, "blocked_reason": blockReason}})
		return "", "", false, errors.New("session expired")
	}
	user, err := connections.FindOneByEmail(email, collection)
	if err != nil {
		return "", "", false, err
	}
	remaining := time.Until(time.Unix(session.ExpiresAt, 0))
	if remaining <= 0 {
		remaining = sessionTTL(session.RememberMe)
	}
	access, err := utils.GenerateJWT(user.Email, user.FirstName, user.LastName, user.UserId, user.UserType)
	if err != nil {
		return "", "", false, err
	}
	newRefresh, err := utils.GenerateRefreshJWT(user.Email, remaining)
	if err != nil {
		return "", "", false, err
	}
	res, err := sessionCollection.UpdateOne(
		connections.DbCtx,
		bson.M{"refresh_token": refreshToken, "is_blocked": false},
		bson.M{
			"$set": bson.M{
				"refresh_token": newRefresh,
				"last_used_at":  time.Now().Unix(),
			},
			"$inc": bson.M{"refresh_count": 1},
		},
	)
	if err != nil {
		return "", "", false, err
	}
	if res.MatchedCount == 0 {
		return "", "", false, errors.New("session not found or blocked")
	}
	return access, newRefresh, session.RememberMe, nil
}

func Logout(refreshToken string) error {
	if refreshToken == "" {
		return nil
	}
	_, err := sessionCollection.UpdateOne(
		connections.DbCtx,
		bson.M{"refresh_token": refreshToken},
		bson.M{"$set": bson.M{"is_blocked": true, "blocked_reason": "logout", "last_used_at": time.Now().Unix()}},
	)
	return err
}
