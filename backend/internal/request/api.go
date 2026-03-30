package request

import (
	"context"
	"os"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
)

const uploadsBaseURL = "http://localhost:8080/uploads/"

func LoadProjects(client *mongo.Client, filter bson.M) ([]bson.M, error) {
	collection := client.Database("tc-web").Collection("projects")
	ctx := context.Background()
	if filter == nil {
		filter = bson.M{}
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var projects []bson.M
	if err := cursor.All(ctx, &projects); err != nil {
		return nil, err
	}

	// Ajouter l'URL complète aux images lors de la récupération
	for i := range projects {
		if imgName, ok := projects[i]["img"].(string); ok && imgName != "" {
			projects[i]["img"] = uploadsBaseURL + imgName
		}
	}

	return projects, nil
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
		labels := parseLabelSelections(c)
		projects, err := LoadProjects(client, buildProjectFilter(labels))
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
		labels := normalizeLabels(rawLabels)
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
		labels, err := fetchDistinctLabels(client)
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
	return normalizeLabels(labels)
}

func normalizeLabels(raw []string) []string {
	seen := make(map[string]struct{})
	result := make([]string, 0, len(raw))
	for _, label := range raw {
		trimmed := strings.TrimSpace(label)
		if trimmed == "" {
			continue
		}
		key := strings.ToLower(trimmed)
		if _, exists := seen[key]; exists {
			continue
		}
		seen[key] = struct{}{}
		result = append(result, trimmed)
	}
	return result
}

func buildProjectFilter(labels []string) bson.M {
	if len(labels) == 0 {
		return bson.M{}
	}
	return bson.M{
		"$or": []bson.M{
			{"label": bson.M{"$in": labels}},
			{"labels": bson.M{"$in": labels}},
		},
	}
}

func fetchDistinctLabels(client *mongo.Client) ([]string, error) {
	collection := client.Database("tc-web").Collection("projects")
	ctx := context.Background()
	labelsMap := make(map[string]string)
	addValues := func(values []any) {
		for _, val := range values {
			label, ok := val.(string)
			if !ok {
				continue
			}
			trimmed := strings.TrimSpace(label)
			if trimmed == "" {
				continue
			}
			key := strings.ToLower(trimmed)
			if _, exists := labelsMap[key]; !exists {
				labelsMap[key] = trimmed
			}
		}
	}

	// Récupérer distincts pour le champ `label` (valeurs string)
	pipeline1 := mongo.Pipeline{
		bson.D{{"$group", bson.D{{"_id", "$label"}}}},
	}
	cur1, err := collection.Aggregate(ctx, pipeline1)
	if err != nil {
		return nil, err
	}
	var docs1 []bson.M
	if err := cur1.All(ctx, &docs1); err != nil {
		return nil, err
	}
	for _, d := range docs1 {
		if v, ok := d["_id"].(string); ok {
			addValues([]any{v})
		}
	}

	// Récupérer distincts pour le champ `labels` (tableau) en unwind puis group
	pipeline2 := mongo.Pipeline{
		bson.D{{"$unwind", "$labels"}},
		bson.D{{"$group", bson.D{{"_id", "$labels"}}}},
	}
	cur2, err := collection.Aggregate(ctx, pipeline2)
	if err != nil {
		return nil, err
	}
	var docs2 []bson.M
	if err := cur2.All(ctx, &docs2); err != nil {
		return nil, err
	}
	for _, d := range docs2 {
		if v, ok := d["_id"].(string); ok {
			addValues([]any{v})
		}
	}

	results := make([]string, 0, len(labelsMap))
	for _, label := range labelsMap {
		results = append(results, label)
	}
	sort.Strings(results)

	return results, nil
}
