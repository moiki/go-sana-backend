package models

import (
	"github.com/google/uuid"
	"go-sana-blackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"golang.org/x/crypto/bcrypt"
	"time"
)

var UserIndex = []mongo.IndexModel{
	{
		Keys:    bson.D{{"email", "text"}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys:    bson.D{{"user_id", -1}},
		Options: options.Index().SetUnique(true),
	},
	{
		Keys: bson.D{{"created_at", -1}},
	},
}

var opts = options.CreateIndexes().SetMaxTime(10 * time.Second)

type User struct {
	UserId       string    `json:"user_id,omitempty" bson:"user_id"`
	FirstName    string    `bson:"first_name" json:"first_name" validate:"required,email"`
	LastName     string    `json:"last_name" bson:"last_name"`
	Email        string    `json:"email" bson:"email"`
	Password     []byte    `json:"password" bson:"password"`
	isActive     bool      `json:"is_active" bson:"is_active, default:true"`
	UserType     string    `json:"user_type" bson:"user_type"`
	RefreshToken string    `json:"refresh_token" bson:"refresh_token"`
	CreatedAt    time.Time `bson:"created_at,default"`
	UpdatedAt    time.Time `bson:"updated_at"`
}

func NewUser(isDefault bool) User {
	user := User{}
	user.UserId = uuid.New().String()
	if user.CreatedAt.IsZero() {
		user.CreatedAt = time.Now()
	}
	if user.UserType == "" {
		user.UserType = "client"
	}
	if isDefault {
		user.Email = utils.EnvData.DefaultUser
		user.FirstName = "Administrator"
		user.isActive = true
		user.UserType = "admin"
		user.HashPassword(utils.EnvData.DefaultPassword)
	}
	return user
}

func (user *User) HashPassword(password string) error {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 5)
	if err != nil {
		return err
	}
	user.Password = bytes
	return nil
}
func (user *User) CheckPassword(providedPassword string) error {
	err := bcrypt.CompareHashAndPassword(user.Password, []byte(providedPassword))
	if err != nil {
		return err
	}
	return nil
}
