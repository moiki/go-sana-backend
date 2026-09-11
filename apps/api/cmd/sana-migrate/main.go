package main

import (
	"flag"
	"fmt"
	"os"

	"github.com/moiki/sana/api/internal/domain"
	"github.com/moiki/sana/api/internal/store"
	"go.mongodb.org/mongo-driver/mongo"
)

var collections = []struct {
	Name    string
	Indexes []mongo.IndexModel
}{
	{Name: "snUsers", Indexes: models.UserIndex},
	{Name: "snProducts", Indexes: models.ProductIndex},
	{Name: "snProductPresentations", Indexes: models.ProductPresentationIndex},
	{Name: "snProviders", Indexes: models.ProviderIndex},
	{Name: "snLaboratories", Indexes: models.LaboratoryIndex},
	{Name: "snSales", Indexes: models.SalesIndex},
	{Name: "snSessions", Indexes: models.SessionIndex},
}

func main() {
	doIndexes := flag.Bool("indexes", false, "create or repair all collection indexes (idempotent)")
	doSeed := flag.Bool("seed", false, "seed the default admin user (idempotent)")
	all := flag.Bool("all", false, "run indexes and seed")
	flag.Parse()

	if *all {
		*doIndexes, *doSeed = true, true
	}
	if !*doIndexes && !*doSeed {
		flag.Usage()
		os.Exit(2)
	}

	if *doIndexes {
		if err := runIndexes(); err != nil {
			fmt.Fprintf(os.Stderr, "indexes failed: %v\n", err)
			os.Exit(1)
		}
	}
	if *doSeed {
		if err := runSeed(); err != nil {
			fmt.Fprintf(os.Stderr, "seed failed: %v\n", err)
			os.Exit(1)
		}
	}
}

func runIndexes() error {
	var failed []string
	for _, c := range collections {
		coll := connections.GetCollection(c.Name, connections.IndexOptions{HasIndex: false})
		if err := connections.EnsureIndex(coll, c.Indexes); err != nil {
			failed = append(failed, c.Name)
			continue
		}
		fmt.Printf("indexes ensured on %s\n", coll.Name())
	}
	if len(failed) > 0 {
		return fmt.Errorf("failed collections: %v", failed)
	}
	return nil
}

func runSeed() error {
	if err := connections.DefaultUser(); err != nil {
		return err
	}
	fmt.Println("default user ensured")
	return nil
}
