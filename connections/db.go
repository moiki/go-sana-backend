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

var collection *mongo.Collection
var DbCtx = context.TODO()

type IndexOptions struct {
	HasIndex bool
	Indexes  []mongo.IndexModel
}

// EnsureIndex will create index on collection provided
func EnsureIndex(cd *mongo.Collection, indexes []mongo.IndexModel) error {

	opts := options.CreateIndexes()

	_indexes, err := cd.Indexes().CreateMany(DbCtx, indexes, opts)
	if err != nil {

		fmt.Printf("error while executing index Query %s  %s\n", cd.Name(), err.Error())
		return err
	}
	fmt.Println(_indexes)
	return nil
}

func GetCollection(name string, indexOptions IndexOptions) *mongo.Collection {

	clientOpts := options.Client().ApplyURI(utils.EnvData.MongoUri)
	client, err := mongo.Connect(DbCtx, clientOpts)
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
	count, err := coll.CountDocuments(DbCtx, bson.M{"email": utils.EnvData.DefaultUser})
	if err != nil {
		panic(err.Error())
		return
	}
	if count == 0 {
		user := models.NewUser(true)
		coll.InsertOne(DbCtx, user)
	}
	return
}

func InsertOne(data interface{}, coll *mongo.Collection) error {
	_, err := coll.InsertOne(DbCtx, data)
	return err
}

func FindOneByEmail(email string, coll *mongo.Collection) (models.User, error) {
	var user models.User
	err := coll.FindOne(DbCtx, bson.M{"email": email}).Decode(&user)
	if err != nil {
		return user, err
	}
	return user, nil
}
