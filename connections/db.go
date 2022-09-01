package connections

import (
	"context"
	"fmt"
	"go-sana-blackend/models"
	"go-sana-blackend/utils"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

var (
	host = "localhost"
	port = 27017
)
var collection *mongo.Collection
var ctx = context.TODO()

type IndexOptions struct {
	HasIndex bool
	Indexes  []mongo.IndexModel
}

// EnsureIndex will create index on collection provided
func EnsureIndex(cd *mongo.Collection, indexes []mongo.IndexModel) error {

	opts := options.CreateIndexes()

	_indexes, err := cd.Indexes().CreateMany(ctx, indexes, opts)
	if err != nil {
		fmt.Printf("error while executing index Query %s\n", err.Error())
		return err
	}
	fmt.Println(_indexes)
	return nil
}

func GetCollection(name string, indexOptions IndexOptions) *mongo.Collection {

	clientOpts := options.Client().ApplyURI(utils.EnvData.MongoUri)
	client, err := mongo.Connect(ctx, clientOpts)
	if err != nil {
		log.Fatal(err)
	}
	coll := client.Database(utils.EnvData.DbName).Collection(name)
	if indexOptions.HasIndex == true {
		EnsureIndex(coll, indexOptions.Indexes)
	}
	return coll
}

func DefaultUser() {
	coll := GetCollection("snUsers", IndexOptions{HasIndex: true, Indexes: models.UserIndex})
	count, err := coll.CountDocuments(ctx, bson.M{"email": utils.EnvData.DefaultUser})
	if err != nil {
		panic(err.Error())
		return
	}
	if count == 0 {
		user := models.NewUser(true)
		coll.InsertOne(ctx, user)
	}
	return
}

func InsertOne(data interface{}, coll *mongo.Collection) error {
	_, err := coll.InsertOne(ctx, data)
	return err
}

func FindOneByEmail(email string, coll *mongo.Collection) (models.User, error) {
	var user models.User
	err := coll.FindOne(ctx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return user, err
	}
	return user, nil
}
