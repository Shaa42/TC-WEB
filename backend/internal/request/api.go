package request

import (
	"context"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const uploadsBaseURL = "http://localhost:8080/uploads/"

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
func GetProjects(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		labels := parseLabelSelections(c)
		projects, err := LoadProjects(client, BuildProjectFilter(labels))
		if err != nil {
			c.JSON(500, gin.H{"error": "Impossible de charger les projets"})
			return
		}
		c.JSON(200, projects)
	}
}

func PostProjects(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		ctx := context.Background()
		title := c.PostForm("title")
		description := c.PostForm("description")
		longDescription := c.PostForm("long_description")
		rawLabels := c.PostFormArray("labels[]")
		if len(rawLabels) == 0 {
			if inline := c.PostForm("labels"); inline != "" {
				rawLabels = append(rawLabels, strings.Split(inline, ",")...)
			}
		}
		labels := NormalizeLabels(rawLabels)
		primaryLabel := "Nouveau"
		if len(labels) > 0 {
			primaryLabel = labels[0]
		}

		if title == "" || description == "" {
			c.JSON(400, gin.H{"error": "titre et description requis"})
			return
		}

		newProject := map[string]any{
			"title":            title,
			"authors":          []string{"Auteur Inconnu"}, // Par défaut ou à récupérer du formulaire
			"label":            primaryLabel,
			"labels":           labels,
			"description":      description,
			"long_description": longDescription,
			"img":              "", // Changé de "images" à "img" (string)
			"like":             0,  // Initialisation des compteurs
			"dislike":          0,
		}

		// Création du dossier uploads s'il n'existe pas
		if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
			c.JSON(500, gin.H{"error": "Impossible de préparer le dossier uploads"})
			return
		}

		form, err := c.MultipartForm()
		if err == nil {
			files := form.File["images"]

			// On ne prend que la première image pour correspondre au format "img": "nom.png"
			if len(files) > 0 {
				file := files[0]
				filepath := "uploads/" + file.Filename
				if err := c.SaveUploadedFile(file, filepath); err == nil {
					// On ne sauvegarde QUE le nom du fichier dans la BDD
					newProject["img"] = file.Filename
				}
			}
		}

		collection := client.Database("tc-web").Collection("projects")
		_, err = collection.InsertOne(ctx, newProject)
		if err != nil {
			c.JSON(500, gin.H{"error": "Impossible de sauvegarder dans la base de données"})
			return
		}

		// Pour la réponse immédiate au frontend, on ajoute l'URL complète
		// pour que l'image s'affiche tout de suite sans recharger la page
		if imgName, ok := newProject["img"].(string); ok && imgName != "" {
			newProject["img"] = uploadsBaseURL + imgName
		}

		c.JSON(200, newProject)
	}
}

func GetLabels(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		labels, err := FetchDistinctLabels(client)
		if err != nil {
			c.JSON(500, gin.H{"error": "Impossible de récupérer les labels"})
			return
		}
		c.JSON(200, labels)
	}
}

func parseLabelSelections(c *gin.Context) []string {
	labels := c.QueryArray("labels")
	if len(labels) == 0 {
		if combined := c.Query("labels"); combined != "" {
			labels = append(labels, strings.Split(combined, ",")...)
		}
	}
	return NormalizeLabels(labels)
}
