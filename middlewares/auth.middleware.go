package middlewares

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	jwtMiddleware "github.com/gofiber/jwt/v2"
	"go-sana-blackend/utils"
)

// JWTProtected func for specify routes group with JWT authentication.
// See: https://github.com/gofiber/jwt
func JWTProtected() func(*fiber.Ctx) error {
	// Create config for JWT authentication middleware.
	config := jwtMiddleware.Config{
		SuccessHandler: jwtSuccess,
		ErrorHandler:   jwtError,
		SigningKey:     []byte(utils.EnvData.SkKey),
	}

	return jwtMiddleware.New(config)
}

func jwtError(c *fiber.Ctx, err error) error {
	// Return status 401 and failed authentication error.
	fmt.Println(err.Error())
	if err.Error() == "Missing or malformed JWT" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": true,
			"msg":   err.Error(),
		})
	}

	// Return status 401 and failed authentication error.
	return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
		"error": true,
		"msg":   err.Error(),
	})
}

func jwtSuccess(c *fiber.Ctx) error {
	c.Locals("token", c.GetRespHeader("Authorization"))
	c.Next()
	return nil
}
