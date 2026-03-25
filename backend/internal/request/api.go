package request

import (
	"encoding/json"
	"os"

	"github.com/gin-gonic/gin"
)

func LoadProjects() []gin.H {
	file, err := os.ReadFile("projects.json")

	if err != nil {
		return []gin.H{}
	}

	var projects []gin.H
	json.Unmarshal(file, &projects)

	return projects
}

func SaveProjects(projects []gin.H) {
	data, _ := json.MarshalIndent(projects, "", "  ")
	os.WriteFile("projects.json", data, 0644)
}

func InterdomainUse(c *gin.Context) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

	if c.Request.Method == "OPTIONS" {
		c.AbortWithStatus(200)
		return
	}

	c.Next()
}

// Get request to get all projects informations
func GetProjects(c *gin.Context) {
	projects := LoadProjects()
	c.JSON(200, projects)
}

func PostProjects(c *gin.Context) {
	var newProject map[string]any

	if err := c.BindJSON(&newProject); err != nil {
		c.JSON(400, gin.H{"error": "invalid"})
		return
	}

	projects := LoadProjects()
	projects = append(projects, newProject)
	SaveProjects(projects)

	c.JSON(200, newProject)
}
