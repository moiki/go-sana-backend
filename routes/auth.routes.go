package routes

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"go-sana-blackend/services"
	"go-sana-blackend/utils"
)

func Login(ctx *fiber.Ctx) error {
	var credentials services.Credentials
	if err := ctx.BodyParser(&credentials); err != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
		return nil
	}
	token, error := services.Login(credentials)
	if error != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": error.Error(),
		})
		return nil
	}
	return ctx.JSON(&fiber.Map{
		"token": fmt.Sprintf("%s", token),
	})
}

func RefreshToken(ctx *fiber.Ctx) error {

	value := map[string]string{}
	ctx.BodyParser(&value)

	err := utils.ValidateToken(value["token"])
	if err != nil {
		fmt.Println(err.Error())
		return ctx.SendStatus(400)
	}
	ctx.JSON(&fiber.Map{"token": value["token"]})
	return nil
}

func AuthRoutes(app fiber.Router) {
	app.Post("/login", Login)
	app.Post("/refreshToken", RefreshToken)
}
