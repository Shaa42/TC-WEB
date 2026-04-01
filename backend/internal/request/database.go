package request

import (
	"context"
	"fmt"
	"os"
	"sort"
	"strings"

	"go.mongodb.org/mongo-driver/v2/bson"
	"go.mongodb.org/mongo-driver/v2/mongo"
	"go.mongodb.org/mongo-driver/v2/mongo/options"
	"go.mongodb.org/mongo-driver/v2/mongo/readpref"
)

func ConnDB(srvString string) (*mongo.Client, error) {
	dbUri := os.Getenv(srvString)
	serverAPI := options.ServerAPI(options.ServerAPIVersion1)
	opts := options.Client().ApplyURI(dbUri).SetServerAPIOptions(serverAPI)

	// Create a new client and connect to the server
	client, err := mongo.Connect(opts)
	if err != nil {
		panic(err)
	}

	// Send a ping to confirm a successful connection
	if err := client.Ping(context.TODO(), readpref.Primary()); err != nil {
		panic(err)
	}
	fmt.Println("Pinged your deployment. You successfully connected to MongoDB!")

	return client, err
}

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

func FetchDistinctLabels(client *mongo.Client) ([]string, error) {
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

func NormalizeLabels(raw []string) []string {
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

func BuildProjectFilter(labels []string) bson.M {
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
