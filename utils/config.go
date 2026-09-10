package utils

import (
	_ "github.com/joho/godotenv/autoload"
	"gopkg.in/go-playground/validator.v9"
	"log"
	"os"
)

var ModelValidation = validator.New()

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	log.Printf("WARNING: %s is not set, using insecure fallback value", key)
	return fallback
}

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
	SkKey:           envOr("JWT_SECRET", "secret"),
	SkRefreshKey:    envOr("JWT_REFRESH_SECRET", "_secret_refresh_"),
}
