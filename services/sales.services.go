package services

import (
	"go-sana-blackend/connections"
	"go-sana-blackend/models"
	"go-sana-blackend/utils"
	"go-sana-blackend/utils/snippets"
	"go.mongodb.org/mongo-driver/bson"
)

var SalesCollection = connections.GetCollection("snSales", connections.IndexOptions{HasIndex: true, Indexes: models.SalesIndex})

func CreateSale(sale models.Sale) error {
	errValid := utils.ModelValidation.Struct(sale)
	if errValid != nil {
		return errValid
	}
	lastInvoice, lError := snippets.GetLastInvoice(SalesCollection)
	if lError != nil {
		return lError
	}
	var totalAmount float64
	for _, detail := range sale.Details {
		totalAmount = totalAmount + detail.SubTotal
	}
	sale.Amount = totalAmount
	sale.InvoiceNumber = lastInvoice.InvoiceNumber + 1
	_, err := SalesCollection.InsertOne(connections.DbCtx, sale)
	if err != nil {
		return err
	}
	return nil
}

func SalesForTable(perPage int16, page int16, filter string) ([]bson.M, error) {
	return snippets.GetSimpleTableFromCollection(perPage, page, filter, SalesCollection)
}
