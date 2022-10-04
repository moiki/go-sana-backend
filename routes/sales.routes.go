package routes

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"go-sana-blackend/middlewares"
	"go-sana-blackend/models"
	"go-sana-blackend/services"
)

func GetSalesTable(ctx *fiber.Ctx) error {
	var params TableParams
	ctx.QueryParser(&params)
	fmt.Println(params, ctx.Query("filter"))
	sales, err := services.SalesForTable(params.PerPage, params.Page, params.Filter)
	if err != nil {
		fmt.Println(err.Error())
		ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		return nil
	}
	//fmt.Println(sales)
	ctx.JSON(fiber.Map{"data": sales})
	return nil
}

func CreateSale(ctx *fiber.Ctx) error {
	newSale := models.Sale{}.NewSale()
	if err := ctx.BodyParser(&newSale); err != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
		return nil
	}
	//fmt.Println(newProduct)
	if len(newSale.Details) < 1 {
		ctx.Status(400).JSON(&fiber.Map{
			"error": "Need to add at least one product",
		})
		return nil
	}
	if errCreate := services.CreateSale(newSale); errCreate != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": errCreate.Error(),
		})
		return nil
	}
	return ctx.JSON(&fiber.Map{
		"message": "Sale Created Successfully!",
	})
}

func SalesRoutes(app fiber.Router) {
	app.Get("/sales/sales-table", middlewares.JWTProtected(), GetSalesTable)
	app.Post("/sales/create", middlewares.JWTProtected(), CreateSale)
}
