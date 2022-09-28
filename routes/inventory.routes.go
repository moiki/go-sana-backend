package routes

import (
	"fmt"
	"github.com/gofiber/fiber/v2"
	"go-sana-blackend/middlewares"
	"go-sana-blackend/models"
	"go-sana-blackend/services"
)

type TableParams struct {
	PerPage int16  `query:"per_page,omitempty"`
	Page    int16  `query:"page,omitempty"`
	Filter  string `query:"filter,omitempty"`
}

// GetProvidersForSelect Handle providers from inventory
func GetProvidersForSelect(ctx *fiber.Ctx) error {
	providers, err := services.ListProviders()
	if err != nil {
		fmt.Println(err.Error())
		ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		return nil
	}
	var providerResult = []map[string]interface{}{}
	for _, provider := range providers {
		providerResult = append(providerResult, map[string]interface{}{
			"provider_id": provider.ProviderId,
			"name":        provider.Name,
		})
	}
	ctx.JSON(fiber.Map{"data": providerResult, "size": len(providerResult)})
	return nil
}

func GetProductPresentationsForSelect(ctx *fiber.Ctx) error {
	providers, err := services.ListProductPresentationForSelect()
	if err != nil {
		fmt.Println(err.Error())
		ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		return nil
	}
	var providerResult = []map[string]interface{}{}
	for _, provider := range providers {
		providerResult = append(providerResult, map[string]interface{}{
			"product_presentation_id": provider.ProductPresentationId,
			"name":                    provider.Name,
		})
	}
	ctx.JSON(fiber.Map{"data": providerResult, "size": len(providerResult)})
	return nil
}

func GetLaboratoriesForSelect(ctx *fiber.Ctx) error {
	providers, err := services.ListLabsForSelect()
	if err != nil {
		fmt.Println(err.Error())
		ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		return nil
	}
	var providerResult = []map[string]interface{}{}
	for _, provider := range providers {
		providerResult = append(providerResult, map[string]interface{}{
			"laboratory_id": provider.LaboratoryId,
			"name":          provider.Name,
		})
	}
	ctx.JSON(fiber.Map{"data": providerResult, "size": len(providerResult)})
	return nil
}

func AddProviderFromInventory(ctx *fiber.Ctx) error {
	newProvider := models.Provider{}.NewProvider()
	if err := ctx.BodyParser(&newProvider); err != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
		return nil
	}
	if errCreate := services.CreateProvider(newProvider); errCreate != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": errCreate.Error(),
		})
		return nil
	}
	return ctx.JSON(&fiber.Map{
		"message": "Provider Created Successfully!",
	})
}

func AddPresentationFromInventory(ctx *fiber.Ctx) error {
	newPresentation := models.ProductPresentation{}.NewProductPresentation()
	if err := ctx.BodyParser(&newPresentation); err != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
		return nil
	}
	if errCreate := services.CreateProductPresentation(newPresentation); errCreate != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": errCreate.Error(),
		})
		return nil
	}
	return ctx.JSON(&fiber.Map{
		"message": "Presentation Created Successfully!",
	})
}

func AddLabFromInventory(ctx *fiber.Ctx) error {
	newLab := models.Laboratory{}.NewLaboratory()
	if err := ctx.BodyParser(&newLab); err != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": err.Error(),
		})
		return nil
	}
	if errCreate := services.CreateLab(newLab); errCreate != nil {
		ctx.Status(400).JSON(&fiber.Map{
			"error": errCreate.Error(),
		})
		return nil
	}
	return ctx.JSON(&fiber.Map{
		"message": "Laboratory Created Successfully!",
	})
}

func GetProductList(ctx *fiber.Ctx) error {
	var params TableParams
	ctx.QueryParser(&params)
	fmt.Println(params, ctx.Query("filter"))
	products, err := services.ListProducts(params.PerPage, params.Page, params.Filter)
	if err != nil {
		fmt.Println(err.Error())
		ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{"message": err.Error()})
		return nil
	}
	//fmt.Println(products)
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
	//fmt.Println(newProduct)
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
	// Getting the select lists
	app.Get("/inventory/providers", middlewares.JWTProtected(), GetProvidersForSelect)
	app.Get("/inventory/presentations", middlewares.JWTProtected(), GetProductPresentationsForSelect)
	app.Get("/inventory/labs", middlewares.JWTProtected(), GetLaboratoriesForSelect)
	// fast add a new element of select list
	app.Post("/inventory/provider", middlewares.JWTProtected(), AddProviderFromInventory)
	app.Post("/inventory/presentation", middlewares.JWTProtected(), AddPresentationFromInventory)
	app.Post("/inventory/lab", middlewares.JWTProtected(), AddLabFromInventory)
}
