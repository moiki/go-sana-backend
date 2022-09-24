package routes

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go-sana-blackend/middlewares"
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

	token, _error := services.Login(credentials)
	if _error != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": _error.Error(),
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

func Me(ctx *fiber.Ctx) error {
	_user := ctx.Locals("user").(*jwt.Token)
	claims := _user.Claims.(jwt.MapClaims)
	//ctx.Context().
	user, err := services.Me(claims["email"].(string))
	if err != nil {
		fmt.Println(err.Error())
		ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		return nil
	}
	ctx.JSON(user)
	return nil
}

func AuthRoutes(app fiber.Router) {
	app.Post("/login", Login)
	app.Get("/me", middlewares.JWTProtected(), Me)
	app.Post("/refreshToken", RefreshToken)
}
