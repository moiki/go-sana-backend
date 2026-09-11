package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/moiki/sana/api/internal/config"
	"github.com/moiki/sana/api/internal/middlewares"
	"github.com/moiki/sana/api/internal/services"
)

const refreshCookieName = "refresh_token"

func refreshCookie(value string, rememberMe bool) *fiber.Cookie {
	maxAge := 0
	if rememberMe {
		maxAge = int(services.SessionTTLRememberMe.Seconds())
	}
	return &fiber.Cookie{
		Name:     refreshCookieName,
		Value:    value,
		Path:     "/api/v1",
		HTTPOnly: true,
		Secure:   config.EnvData.CookieSecure,
		SameSite: "Lax",
		MaxAge:   maxAge,
	}
}

func clearRefreshCookie(ctx *fiber.Ctx) {
	ctx.ClearCookie(refreshCookieName, "", "/api/v1")
}

func Login(ctx *fiber.Ctx) error {
	var credentials services.Credentials
	if err := ctx.BodyParser(&credentials); err != nil {
		return ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
	}

	token, refreshToken, rememberMe, _error := services.Login(credentials, ctx.IP(), ctx.Get("User-Agent"))
	if _error != nil {
		return ctx.Status(400).JSON(&fiber.Map{
			"error": _error.Error(),
		})
	}
	ctx.Cookie(refreshCookie(refreshToken, rememberMe))
	return ctx.JSON(&fiber.Map{
		"token": token,
	})
}

func RefreshToken(ctx *fiber.Ctx) error {
	refreshToken := ctx.Cookies(refreshCookieName)
	if refreshToken == "" {
		return ctx.Status(401).JSON(&fiber.Map{
			"error": "missing refresh token cookie",
		})
	}

	token, newRefresh, rememberMe, err := services.RefreshToken(refreshToken)
	if err != nil {
		clearRefreshCookie(ctx)
		return ctx.Status(401).JSON(&fiber.Map{
			"error": err.Error(),
		})
	}
	ctx.Cookie(refreshCookie(newRefresh, rememberMe))
	return ctx.JSON(&fiber.Map{
		"token": token,
	})
}

func Logout(ctx *fiber.Ctx) error {
	refreshToken := ctx.Cookies(refreshCookieName)
	if refreshToken != "" {
		_ = services.Logout(refreshToken)
	}
	clearRefreshCookie(ctx)
	return ctx.JSON(&fiber.Map{
		"message": "logged out",
	})
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
	app.Post("/logout", Logout)
}
