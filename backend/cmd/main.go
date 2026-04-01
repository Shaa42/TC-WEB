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

	// API
	r := gin.Default()

	// interdomain
	r.Use(request.InterdomainUse)

	// static files (images uploads)
	r.Static("/uploads", "./uploads")

	// Get all projects
	r.GET("/api/projects", request.GetProjects(client))

	// Get all labels
	r.GET("/api/labels", request.GetLabels(client))

	// Post a new project
	r.POST("/api/projects", request.PostProjects(client))

	// Like and dislike a project
	r.POST("/api/projects/:id/like", request.PostLike(client))
	r.POST("/api/projects/:id/dislike", request.PostDislike(client))

	r.Run(":8080")
}
