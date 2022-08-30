package utils

import (
	_ "github.com/joho/godotenv/autoload"
	"os"
)

//var Port = os.Getenv("PORT")

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
