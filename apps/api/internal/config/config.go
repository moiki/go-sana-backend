package config

import (
	"log"
	"os"

	_ "github.com/joho/godotenv/autoload"
)

func envOr(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	log.Printf("WARNING: %s is not set, using insecure fallback value", key)
	return fallback
}

// EnvData holds all runtime configuration, read once at startup from the
// environment / .env. Never add secrets as literals here.
var EnvData = struct {
	Port            string
	MongoUri        string
	DbName          string
	DefaultUser     string
	DefaultPassword string
	SkKey           string
	SkRefreshKey    string
	CookieSecure    bool
	LogLevel        string
}{
	Port:            envOr("PORT", "9000"),
	MongoUri:        os.Getenv("MONGO_URI"),
	DbName:          envOr("MONGO_DB", "sanafarmadb"),
	DefaultUser:     os.Getenv("DEF_USER"),
	DefaultPassword: os.Getenv("DEF_PASS"),
	SkKey:           envOr("JWT_SECRET", "secret"),
	SkRefreshKey:    envOr("JWT_REFRESH_SECRET", "_secret_refresh_"),
	CookieSecure:    os.Getenv("COOKIE_SECURE") == "true" || os.Getenv("COOKIE_SECURE") == "1",
	LogLevel:        envOr("LOG_LEVEL", "info"),
}
