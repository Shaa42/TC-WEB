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
				"image":       "https://picsum.photos/400?1",
			},
			{
				"title":       "AI Music",
				"description": "Generate music with AI",
				"image":       "https://picsum.photos/400?2",
			},
			{
				"title":       "Delivery Robot",
				"description": "Autonomous delivery",
				"image":       "https://picsum.photos/400?3",
			},
		})
	})

	r.Run(":8080")
}
