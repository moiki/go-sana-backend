package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"go-sana-blackend/middlewares"
	"go-sana-blackend/services"
)

func Login(ctx *fiber.Ctx) error {
	var credentials services.Credentials
	if err := ctx.BodyParser(&credentials); err != nil {
		return ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
	}

	token, refreshToken, _error := services.Login(credentials)
	if _error != nil {
		return ctx.Status(400).JSON(&fiber.Map{
			"error": _error.Error(),
		})
	}
	return ctx.JSON(&fiber.Map{
		"token":         token,
		"refresh_token": refreshToken,
	})
}

func RefreshToken(ctx *fiber.Ctx) error {
	value := map[string]string{}
	if err := ctx.BodyParser(&value); err != nil {
		return ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
	}

	tokens, err := services.RefreshToken(value["token"])
	if err != nil {
		return ctx.Status(401).JSON(&fiber.Map{
			"error": err.Error(),
		})
	}
	return ctx.JSON(tokens)
}

func Me(ctx *fiber.Ctx) error {
	_user := ctx.Locals("user").(*jwt.Token)
	claims, ok := _user.Claims.(jwt.MapClaims)
	if !ok {
		return ctx.Status(400).JSON(fiber.Map{"message": "invalid token claims"})
	}
	email, ok := claims["email"].(string)
	if !ok {
		return ctx.Status(400).JSON(fiber.Map{"message": "invalid token claims"})
	}
	user, err := services.Me(email)
	if err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
	}
	return ctx.JSON(user)
}

func AuthRoutes(app fiber.Router) {
	app.Post("/login", Login)
	app.Get("/me", middlewares.JWTProtected(), Me)
	app.Post("/refreshToken", RefreshToken)
}
