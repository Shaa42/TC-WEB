package main

import (
	"context"
	"log"

	"tc-web/internal/request"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	err := godotenv.Load(".env")
	if err != nil {
		_ = godotenv.Load("cmd/.env")
	}

	// Create a new client and connect to the server
	client, err := request.ConnDB("DB_SRV_STRING")
	if err != nil {
		log.Fatal(err)
	}

	// Disconnect the client when the program end
	defer func() {
		if client != nil {
			if err := client.Disconnect(context.TODO()); err != nil {
				panic(err)
			}
		}
	}()

	// Request users collection
	// usersCollection := client.Database("sample_mflix").Collection("users")
	// cursor, err := usersCollection.Find(context.TODO(), bson.D{})
	// if err != nil {
	// 	panic(err)
	// }
	// defer cursor.Close(context.TODO())

	// var users []bson.M
	// if err := cursor.All(context.TODO(), &users); err != nil {
	// 	panic(err)
	// }

	// if users == nil {
	// 	users = []bson.M{}
	// }

	// API
	r := gin.Default()

	// interdomain
	r.Use(request.InterdomainUse)

	// static files (images uploads)
	r.Static("/uploads", "./uploads")

	r.GET("/api/projects", request.GetProjects(client))
	r.GET("/api/labels", request.GetLabels(client))
	r.POST("/api/projects", request.PostProjects(client))

	r.POST("/api/projects/:id/like", request.PostLike(client))
	r.POST("/api/projects/:id/dislike", request.PostDislike(client))

	r.Run(":8080")
}
