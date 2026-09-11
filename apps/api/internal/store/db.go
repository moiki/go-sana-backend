package connections

import (
	"context"
	"fmt"
	"github.com/moiki/sana/api/internal/config"
	"github.com/moiki/sana/api/internal/domain"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"log"
)

var DbCtx = context.TODO()

var mongoClient *mongo.Client

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

// Connect lazily creates a single MongoDB client shared by every collection.
func Connect() (*mongo.Client, error) {
	if mongoClient != nil {
		return mongoClient, nil
	}
	clientOpts := options.Client().ApplyURI(config.EnvData.MongoUri)
	client, err := mongo.Connect(DbCtx, clientOpts)
	if err != nil {
		return nil, err
	}
	mongoClient = client
	return mongoClient, nil
}

func GetCollection(name string, indexOptions IndexOptions) *mongo.Collection {
	client, err := Connect()
	if err != nil {
		log.Fatal(err)
	}
	coll := client.Database(config.EnvData.DbName).Collection(name)
	if indexOptions.HasIndex == true {
		EnsureIndex(coll, indexOptions.Indexes)
	}
	return coll
}

// Ping verifies the shared Mongo client can reach the server.
func Ping(ctx context.Context) error {
	client, err := Connect()
	if err != nil {
		return err
	}
	return client.Ping(ctx, nil)
}

// WithTransaction runs fn inside a MongoDB session transaction. A transaction
// requires a replica set / Atlas; on standalone dev instances the session is
// still usable but transactions will fail, so callers must handle that error.
func WithTransaction(ctx context.Context, fn func(sctx mongo.SessionContext) error) error {
	client, err := Connect()
	if err != nil {
		return err
	}
	session, err := client.StartSession()
	if err != nil {
		return err
	}
	defer session.EndSession(ctx)
	_, err = session.WithTransaction(ctx, func(sctx mongo.SessionContext) (interface{}, error) {
		return nil, fn(sctx)
	})
	return err
}

func DefaultUser() error {
	coll := GetCollection("snUsers", IndexOptions{HasIndex: true, Indexes: models.UserIndex})
	count, err := coll.CountDocuments(DbCtx, bson.M{"email": config.EnvData.DefaultUser})
	if err != nil {
		return err
	}
	if count == 0 {
		user := models.NewUser(true)
		if _, err := coll.InsertOne(DbCtx, user); err != nil {
			return err
		}
	}
	return nil
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
