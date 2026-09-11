package services

import (
	"github.com/moiki/sana/api/internal/domain"
	"github.com/moiki/sana/api/internal/store"
	"github.com/moiki/sana/api/internal/utils"
	"github.com/moiki/sana/api/internal/utils/snippets"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"time"
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

type SalesDashboard struct {
	TodayTotal  float64  `json:"today_total"`
	TodayTicket int64    `json:"today_tickets"`
	LatestSales []bson.M `json:"latest_sales"`
}

func SalesDashboardForToday() (SalesDashboard, error) {
	now := time.Now()
	startOfDay := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())

	pipe := utils.ParsePipeline([]bson.M{
		{
			"$match": bson.M{
				"createdAt": bson.M{
					"$gte": startOfDay,
				},
			},
		},
		{
			"$facet": bson.M{
				"todayTotal": bson.A{
					bson.M{
						"$group": bson.M{
							"_id": nil,
							"total": bson.M{
								"$sum": "$amount",
							},
						},
					},
				},
				"tickets": bson.A{
					bson.M{
						"$count": "count",
					},
				},
				"latest": bson.A{
					bson.M{
						"$sort": bson.M{
							"createdAt": -1,
						},
					},
					bson.M{
						"$limit": 10,
					},
					bson.M{
						"$project": bson.M{
							"_id":            0,
							"invoice_number": 1,
							"client_name":    1,
							"amount":         1,
							"paid_with":      1,
							"change":         1,
							"createdAt":      1,
						},
					},
				},
			},
		},
	})

	var result []struct {
		TodayTotal []struct {
			Total float64 `bson:"total"`
		} `bson:"todayTotal"`
		Tickets []struct {
			Count int64 `bson:"count"`
		} `bson:"tickets"`
		Latest []bson.M `bson:"latest"`
	}

	data, err := SalesCollection.Aggregate(connections.DbCtx, mongo.Pipeline(pipe))
	if err != nil {
		return SalesDashboard{}, err
	}
	if err := data.All(connections.DbCtx, &result); err != nil {
		return SalesDashboard{}, err
	}

	dashboard := SalesDashboard{LatestSales: []bson.M{}}
	if len(result) > 0 {
		if len(result[0].TodayTotal) > 0 {
			dashboard.TodayTotal = result[0].TodayTotal[0].Total
		}
		if len(result[0].Tickets) > 0 {
			dashboard.TodayTicket = result[0].Tickets[0].Count
		}
		if result[0].Latest != nil {
			dashboard.LatestSales = result[0].Latest
		}
	}
	return dashboard, nil
}
