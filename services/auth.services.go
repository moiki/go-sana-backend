package services

import (
	"errors"
	"fmt"
	"go-sana-blackend/connections"
	"go-sana-blackend/models"
	"go-sana-blackend/utils"
	"go.mongodb.org/mongo-driver/bson"
)

var collection = connections.GetCollection("snUsers", connections.IndexOptions{HasIndex: true, Indexes: models.UserIndex})
var sessionCollection = connections.GetCollection("snSessions", connections.IndexOptions{HasIndex: false})

type Credentials struct {
	Email    string `json:"email,omitempty"`
	Password string `json:"password,omitempty"`
}

func Login(data Credentials) (string, string, error) {
	var user models.User
	m := models.Session{}
	session := m.NewSession()
	errFind := collection.FindOne(connections.DbCtx, bson.M{"email": data.Email}).Decode(&user)
	if errFind != nil {
		return "", "", errFind
	}
	if err := user.CheckPassword(data.Password); err != nil {
		fmt.Println("error in check pass ", err.Error())
		return "", "", err
	}
	token, err := utils.GenerateJWT(user.Email, user.FirstName, user.LastName, user.UserId, user.UserType)
	if err != nil {
		fmt.Println("error in token ", err.Error())
		return "", "", err
	}
	refreshTk, err := utils.GenerateRefreshJWT(user.Email)
	if err != nil {
		fmt.Println("error in refresh ", err.Error())
		return "", "", err
	}
	// generate session
	session.UserEmail = user.Email
	session.RefreshToken = refreshTk
	if err := connections.InsertOne(session, sessionCollection); err != nil {
		fmt.Println("error in session ", err.Error())
		return "", "", err
	}
	return token, refreshTk, nil
}

func Me(email string) (models.User, error) {
	return connections.FindOneByEmail(email, collection)
}

func RefreshToken(refreshToken string) (map[string]string, error) {
	if err := utils.ValidateRefreshToken(refreshToken); err != nil {
		return nil, err
	}
	email, err := utils.ExtractEmailFromRefreshToken(refreshToken)
	if err != nil {
		return nil, err
	}
	user, err := connections.FindOneByEmail(email, collection)
	if err != nil {
		return nil, err
	}
	access, err := utils.GenerateJWT(user.Email, user.FirstName, user.LastName, user.UserId, user.UserType)
	if err != nil {
		return nil, err
	}
	newRefresh, err := utils.GenerateRefreshJWT(user.Email)
	if err != nil {
		return nil, err
	}
	res, err := sessionCollection.UpdateOne(
		connections.DbCtx,
		bson.M{"refresh_token": refreshToken, "is_blocked": false},
		bson.M{"$set": bson.M{"refresh_token": newRefresh}},
	)
	if err != nil {
		return nil, err
	}
	if res.MatchedCount == 0 {
		return nil, errors.New("session not found or blocked")
	}
	return map[string]string{"token": access, "refresh_token": newRefresh}, nil
}
