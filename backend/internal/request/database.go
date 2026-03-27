package request

import (
	"context"
	"fmt"
	"os"

	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

func ConnDB(srvString string) (*mongo.Client, error) {
	dbUri := os.Getenv(srvString)
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(dbUri).SetServerAPIOptions(serverAPI)

	// Create a new client and connect to the server
	client, err := mongo.Connect(opts)
	if err != nil {
		panic(err)
	}

	// Send a ping to confirm a successful connection
	if err := client.Ping(context.TODO(), readpref.Primary()); err != nil {
		panic(err)
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")

	return client, err
}

var projectsCollection *mongo.Collection

func InitProjectCollection(client *mongo.Client) {
	dbName := os.Getenv("DB_NAME")
	if dbName == "" {
		dbName = "projectdb"
	}
	collectionName := os.Getenv("PROJECTS_COLLECTION")
	if collectionName == "" {
		collectionName = "projects"
	}
	projectsCollection = client.Database(dbName).Collection(collectionName)
}

func GetProjectsCollection() *mongo.Collection {
	return projectsCollection
}
