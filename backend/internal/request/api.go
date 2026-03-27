package request

import (
	"context"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/bson/primitive"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
)

type Project struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Description string             `bson:"description" json:"description"`
	Images      []string           `bson:"images" json:"images"`
	Likes       int                `bson:"likes" json:"likes"`
	Dislikes    int                `bson:"dislikes" json:"dislikes"`
	CreatedAt   time.Time          `bson:"createdAt" json:"createdAt"`
}

func projectCollection() *mongo.Collection {
	collection := GetProjectsCollection()
	if collection == nil {
		panic("projects collection not initialized")
	}
	return collection
}

func InterdomainUse(c *gin.Context) {
	c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
	c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")

	if c.Request.Method == http.MethodOptions {
		c.AbortWithStatus(http.StatusOK)
		return
	}

	c.Next()
}

func GetProjects(c *gin.Context) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := projectCollection().Find(ctx, bson.M{}, options.Find().SetSort(bson.D{{Key: "createdAt", Value: -1}}))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "impossible de charger les projets"})
		return
	}
	defer cursor.Close(ctx)

	var projects []Project
	if err := cursor.All(ctx, &projects); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erreur pendant la lecture des projets"})
		return
	}

	c.JSON(http.StatusOK, projects)
}

func PostProjects(c *gin.Context) {
	title := c.PostForm("title")
	description := c.PostForm("description")

	if title == "" || description == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "titre et description requis"})
		return
	}

	newProject := Project{
		Title:       title,
		Description: description,
		Images:      []string{},
		Likes:       0,
		Dislikes:    0,
		CreatedAt:   time.Now(),
	}

	os.MkdirAll("uploads", os.ModePerm)

	form, err := c.MultipartForm()
	if err == nil {
		files := form.File["images"]
		var imageUrls []string
		for _, file := range files {
			filepath := "uploads/" + file.Filename
			if err := c.SaveUploadedFile(file, filepath); err == nil {
				imageUrls = append(imageUrls, "http://localhost:8080/"+filepath)
			}
		}
		newProject.Images = imageUrls
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	result, err := projectCollection().InsertOne(ctx, newProject)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "impossible d'enregistrer le projet"})
		return
	}
	if insertedID, ok := result.InsertedID.(primitive.ObjectID); ok {
		newProject.ID = insertedID
	}

	c.JSON(http.StatusOK, newProject)
}

func LikeProject(c *gin.Context) {
	updateReaction(c, "likes")
}

func DislikeProject(c *gin.Context) {
	updateReaction(c, "dislikes")
}

func updateReaction(c *gin.Context, field string) {
	projectID := c.Param("id")
	objID, err := primitive.ObjectIDFromHex(projectID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "identifiant de projet invalide"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	update := bson.M{"$inc": bson.M{field: 1}}
	findOptions := options.FindOneAndUpdate().SetReturnDocument(options.After)
	res := projectCollection().FindOneAndUpdate(ctx, bson.M{"_id": objID}, update, findOptions)
	if err := res.Err(); err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "projet introuvable"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "impossible de mettre à jour"})
		return
	}

	var updated Project
	if err := res.Decode(&updated); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "erreur pendant la lecture du projet"})
		return
	}

	c.JSON(http.StatusOK, updated)
}
