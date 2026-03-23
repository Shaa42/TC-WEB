package main

import (
	"encoding/json"
	"os"

	"github.com/gin-gonic/gin"
)

func loadProjects() []gin.H {
	file, err := os.ReadFile("projects.json")

	if err != nil {
		return []gin.H{}
	}

	var projects []gin.H
	json.Unmarshal(file, &projects)

	return projects
}

func saveProjects(projects []gin.H) {
	data, _ := json.MarshalIndent(projects, "", "  ")
	os.WriteFile("projects.json", data, 0644)
}

func main() {
	r := gin.Default()

	// interdomain
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}

		c.Next()
	})

	// API
	r.GET("/api/projects", func(c *gin.Context) {
		projects := loadProjects()
		c.JSON(200, projects)
	})

	r.POST("/api/projects", func(c *gin.Context) {
		var newProject map[string]interface{}

		if err := c.BindJSON(&newProject); err != nil {
			c.JSON(400, gin.H{"error": "invalid"})
			return
		}

		projects := loadProjects()
		projects = append(projects, newProject)
		saveProjects(projects)

		c.JSON(200, newProject)
	})

	r.Run(":8080")
}
