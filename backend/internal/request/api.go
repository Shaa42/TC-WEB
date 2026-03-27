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
	title := c.PostForm("title")
	description := c.PostForm("description")

	if title == "" || description == "" {
		c.JSON(400, gin.H{"error": "titre et description requis"})
		return
	}

	newProject := map[string]any{
		"title":       title,
		"description": description,
		"images":      []string{},
	}

	// Création du dossier uploads s'il n'existe pas
	os.MkdirAll("uploads", os.ModePerm)

	form, err := c.MultipartForm()
	if err == nil {
		files := form.File["images"]
		var imageUrls []string

		for _, file := range files {
			filepath := "uploads/" + file.Filename
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				// L'URL d'accès qui sera utilisée par le frontend
				imageUrls = append(imageUrls, "http://localhost:8080/"+filepath)
			}
		}
		newProject["images"] = imageUrls
	}

	projects := LoadProjects()
	projects = append(projects, newProject)
	SaveProjects(projects)

	c.JSON(200, newProject)
}
