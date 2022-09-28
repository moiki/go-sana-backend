package utils

import (
	_ "github.com/joho/godotenv/autoload"
	"gopkg.in/go-playground/validator.v9"
	"os"
)

var ModelValidation = validator.New()

var EnvData = struct {
	Port            string
	MongoUri        string
	DbName          string
	DefaultUser     string
	DefaultPassword string
	SkKey           string
	SkRefreshKey    string
}{
	Port:            os.Getenv("PORT"),
	MongoUri:        os.Getenv("MONGO_URI"),
	DbName:          os.Getenv("MONGO_DB"),
	DefaultUser:     os.Getenv("DEF_USER"),
	DefaultPassword: os.Getenv("DEF_PASS"),
	SkKey:           "secret",
	SkRefreshKey:    "_secret_refresh_",
}
