package routes

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"go-sana-blackend/middlewares"
	"go-sana-blackend/models"
	"go-sana-blackend/services"
)

func GetProductList(ctx *fiber.Ctx) error {
	products, err := services.ListProducts(1, 10)
	if err != nil {
		fmt.Println(err.Error())
		ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		return nil
	}
	ctx.JSON(fiber.Map{"data": products})
	return nil
}

func CreateProduct(ctx *fiber.Ctx) error {
	newProduct := models.Product{}.NewProduct()
	if err := ctx.BodyParser(&newProduct); err != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
		return nil
	}
	if errCreate := services.CreateProduct(newProduct); errCreate != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": errCreate.Error(),
		})
		return nil
	}
	return ctx.JSON(&fiber.Map{
		"message": "Product Created Successfully!",
	})
}

func InventoryRoutes(app fiber.Router) {
	app.Get("/inventory/list", middlewares.JWTProtected(), GetProductList)
	app.Post("/inventory/create", middlewares.JWTProtected(), CreateProduct)
}
