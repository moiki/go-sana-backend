package app

import (
	"context"
	"log/slog"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/moiki/sana/api/internal/config"
	"github.com/moiki/sana/api/internal/http"
	"github.com/moiki/sana/api/internal/store"
)

// New builds the Fiber app with logging, request-id, CORS and routes wired.
// It does not connect to MongoDB; call Run to start the server.
func New() *fiber.App {
	setupLogger()

	fiberApp := fiber.New(fiber.Config{
		AppName: "sana-api",
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			slog.Error("request failed",
				"request_id", c.GetRespHeader("x-request-id"),
				"method", c.Method(),
				"path", c.Path(),
				"error", err.Error(),
			)
			return fiber.DefaultErrorHandler(c, err)
		},
	})

	fiberApp.Use(requestid.New())
	fiberApp.Use(accessLog())
	fiberApp.Use(recover.New())
	fiberApp.Use(cors.New(cors.Config{
		AllowOriginsFunc: func(origin string) bool { return true },
		AllowCredentials: true,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, PATCH, OPTIONS",
	}))

	fiberApp.Get("/health", func(c *fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "ok"})
	})
	fiberApp.Get("/ready", readyHandler)

	api := fiberApp.Group("/api/v1")
	routes.AuthRoutes(api)
	routes.InventoryRoutes(api)
	routes.SalesRoutes(api)

	return fiberApp
}

// Run connects to MongoDB, seeds the default user, and starts listening.
func Run() {
	app := New()
	if err := connections.DefaultUser(); err != nil {
		slog.Error("failed to seed default user", "error", err.Error())
		os.Exit(1)
	}
	slog.Info("sana-api listening",
		"port", config.EnvData.Port,
		"mongo_db", config.EnvData.DbName,
	)
	if err := app.Listen(":" + config.EnvData.Port); err != nil {
		slog.Error("server stopped", "error", err.Error())
		os.Exit(1)
	}
}

func setupLogger() {
	level := slog.LevelInfo
	switch config.EnvData.LogLevel {
	case "debug":
		level = slog.LevelDebug
	case "warn":
		level = slog.LevelWarn
	case "error":
		level = slog.LevelError
	}
	slog.SetDefault(slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: level})))
}

func accessLog() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		slog.Info("request",
			"request_id", c.GetRespHeader("x-request-id"),
			"method", c.Method(),
			"path", c.Path(),
			"status", c.Response().StatusCode(),
			"duration_ms", time.Since(start).Milliseconds(),
		)
		return err
	}
}

func readyHandler(c *fiber.Ctx) error {
	ctx, cancel := context.WithTimeout(c.Context(), 2*time.Second)
	defer cancel()
	if err := connections.Ping(ctx); err != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"status": "not_ready", "error": err.Error()})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"status": "ready"})
}
