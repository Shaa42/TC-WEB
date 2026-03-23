package main

import (
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	// interdomain
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Next()
	})

	// API
	r.GET("/api/projects", func(c *gin.Context) {
		c.JSON(200, []gin.H{
			{
				"title":       "Smart Parking",
				"description": "IoT parking system",
				"images":      []string{"https://picsum.photos/400?1", "https://picsum.photos/400?2", "https://picsum.photos/400?3"},
			},
			{
				"title":       "AI Music",
				"description": "Generate music with AI",
				"images":      []string{"https://picsum.photos/400?4", "https://picsum.photos/400?5", "https://picsum.photos/400?6"},
			},
			{
				"title":       "Delivery Robot",
				"description": "Autonomous delivery",
				"images":      []string{"https://picsum.photos/400?7", "https://picsum.photos/400?8", "https://picsum.photos/400?9"},
			},
		})
	})

	r.Run(":8080")
}
