package services

import (
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

func Login(data Credentials) (string, error) {
	var user models.User
	m := models.Session{}
	session := m.NewSession()
	errFind := collection.FindOne(connections.MongoCtx, bson.M{"email": data.Email}).Decode(&user)
	if errFind != nil {
		return "", errFind
	}
	err := user.CheckPassword(data.Password)
	if err != nil {
		fmt.Println("error in check pass ", err.Error())
		return "", err
	}
	token, errorGt := utils.GenerateJWT(user.Email, user.FirstName, user.LastName, user.UserId, user.UserType)
	refreshTk, errRf := utils.GenerateRefreshJWT(user.Email)
	if errRf != nil {
		fmt.Println("error in refresh ", errRf.Error())
		return "", errRf
	}
	if errorGt != nil {
		fmt.Println("error in token ", errorGt.Error())
		return "", errorGt
	}
	// generate session
	session.UserEmail = user.Email
	session.RefreshToken = refreshTk
	errSession := connections.InsertOne(session, sessionCollection)
	if errSession != nil {
		fmt.Println("error in session ", errSession.Error())
		return "", errSession
	}
	return token, nil
}

func Me(email string) (models.User, error) {
	return connections.FindOneByEmail(email, collection)
}

func RefreshToken(token string) (string, error) {
	err := utils.ValidateToken(token)
	if err != nil {
		return "", err
	}
	return token, nil
}
