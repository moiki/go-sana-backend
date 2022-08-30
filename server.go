package main

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"go-sana-blackend/connections"
	"go-sana-blackend/routes"
	"go-sana-blackend/utils"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	connections.DefaultUser()
	api := app.Group("/api/v1")
	routes.AuthRoutes(api)
	app.Listen(":" + utils.EnvData.Port)
	fmt.Println("Server is running on http://localhost:9000")
}
