package request

import (
	"context"
	"os"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

func LoadProjects(client *mongo.Client) []bson.M {
	projects, err := GetDBProjects(client)
	if err != nil {
		return []bson.M{}
	}

	// Ajouter l'URL complète aux images lors de la récupération
	for i := range projects {
		if imgName, ok := projects[i]["img"].(string); ok && imgName != "" {
			projects[i]["img"] = "http://localhost:8080/uploads/" + imgName
		}
	}

	return projects
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
func GetProjects(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		projects := LoadProjects(client)
		c.JSON(200, projects)
	}
}

func PostProjects(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		title := c.PostForm("title")
		description := c.PostForm("description")

		if title == "" || description == "" {
			c.JSON(400, gin.H{"error": "titre et description requis"})
			return
		}

		newProject := map[string]any{
			"title":       title,
			"authors":     []string{"Auteur Inconnu"}, // Par défaut ou à récupérer du formulaire
			"label":       "Nouveau",                  // Valeur par défaut
			"description": description,
			"img":         "", // Changé de "images" à "img" (string)
			"like":        0,  // Initialisation des compteurs
			"dislike":     0,
		}

		// Création du dossier uploads s'il n'existe pas
		os.MkdirAll("uploads", os.ModePerm)

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

		collection := client.Database("tc-web").Collection("projets")
		_, err = collection.InsertOne(context.TODO(), newProject)
		if err != nil {
			c.JSON(500, gin.H{"error": "Impossible de sauvegarder dans la base de données"})
			return
		}

		// Pour la réponse immédiate au frontend, on ajoute l'URL complète
		// pour que l'image s'affiche tout de suite sans recharger la page
		if imgName, ok := newProject["img"].(string); ok && imgName != "" {
			newProject["img"] = "http://localhost:8080/uploads/" + imgName
		}

		c.JSON(200, newProject)
	}
}

func PostLike(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		objID, err := bson.ObjectIDFromHex(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "ID de projet invalide"})
			return
		}

		collection := client.Database("tc-web").Collection("projects")

		// Utilisation de $inc pour augmenter le compteur de 1
		result, err := collection.UpdateOne(
			context.TODO(),
			bson.M{"_id": objID},
			bson.M{"$inc": bson.M{"like": 1}},
		)

		if err != nil {
			c.JSON(500, gin.H{"error": "Erreur lors du like"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(404, gin.H{"error": "Projet introuvable"})
			return
		}

		c.JSON(200, gin.H{"message": "Like enregistré", "id": id})
	}
}

func PostDislike(client *mongo.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.Param("id")
		objID, err := bson.ObjectIDFromHex(id)
		if err != nil {
			c.JSON(400, gin.H{"error": "ID de projet invalide"})
			return
		}

		collection := client.Database("tc-web").Collection("projects")

		// Utilisation de $inc pour augmenter le compteur de dislike
		result, err := collection.UpdateOne(
			context.TODO(),
			bson.M{"_id": objID},
			bson.M{"$inc": bson.M{"dislike": 1}},
		)

		if err != nil {
			c.JSON(500, gin.H{"error": "Erreur lors du dislike"})
			return
		}

		if result.MatchedCount == 0 {
			c.JSON(404, gin.H{"error": "Projet introuvable"})
			return
		}

		c.JSON(200, gin.H{"message": "Dislike enregistré", "id": id})
	}
}
