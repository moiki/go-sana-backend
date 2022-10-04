package main

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"go-sana-blackend/connections"
	"go-sana-blackend/routes"
	"go-sana-blackend/utils"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())
	//app.Use(csrf.New())
	connections.DefaultUser()
	app.Get("/active", func(ctx *fiber.Ctx) error {
		ctx.Status(fiber.StatusOK).SendString("I am running!</h1>")
		return nil
	})
	api := app.Group("/api/v1")
	routes.AuthRoutes(api)
	routes.InventoryRoutes(api)
	routes.SalesRoutes(api)
	app.Listen(":" + utils.EnvData.Port)
	fmt.Println("Server is running on http://localhost:9000")
}
