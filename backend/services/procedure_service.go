package services

import (
	"context"
	"fmt"
	"time"
	"web_AI/config"
	"web_AI/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// GetProcedures retrieves all procedures with optional filtering
func GetProcedures(category string, limit int64) ([]models.Procedure, error) {
	collection := config.GetCollection("procedures")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{}
	if category != "" {
		filter["category"] = category
	}

	opts := options.Find()
	if limit > 0 {
		opts.SetLimit(limit)
	}
	opts.SetSort(bson.D{bson.E{Key: "createdAt", Value: -1}})

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var procedures []models.Procedure
	if err = cursor.All(ctx, &procedures); err != nil {
		return nil, err
	}

	return procedures, nil
}

// GetProcedureByID retrieves a single procedure by ID
func GetProcedureByID(id string) (*models.Procedure, error) {
	collection := config.GetCollection("procedures")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, fmt.Errorf("invalid procedure ID")
	}

	var procedure models.Procedure
	err = collection.FindOne(ctx, bson.M{"_id": objID}).Decode(&procedure)
	if err != nil {
		return nil, err
	}

	return &procedure, nil
}

// CreateProcedure creates a new procedure
func CreateProcedure(procedure *models.Procedure) error {
	collection := config.GetCollection("procedures")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	procedure.ID = primitive.NewObjectID()
	procedure.CreatedAt = time.Now()
	procedure.UpdatedAt = time.Now()

	_, err := collection.InsertOne(ctx, procedure)
	return err
}

// UpdateProcedure updates an existing procedure
func UpdateProcedure(id string, procedure *models.Procedure) error {
	collection := config.GetCollection("procedures")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid procedure ID")
	}

	procedure.UpdatedAt = time.Now()
	update := bson.M{
		"$set": bson.M{
			"title":       procedure.Title,
			"content":     procedure.Content,
			"category":    procedure.Category,
			"description": procedure.Description,
			"updatedAt":   procedure.UpdatedAt,
		},
	}

	_, err = collection.UpdateOne(ctx, bson.M{"_id": objID}, update)
	return err
}

// DeleteProcedure deletes a procedure by ID
func DeleteProcedure(id string) error {
	collection := config.GetCollection("procedures")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return fmt.Errorf("invalid procedure ID")
	}

	result, err := collection.DeleteOne(ctx, bson.M{"_id": objID})
	if err != nil {
		return err
	}

	if result.DeletedCount == 0 {
		return fmt.Errorf("procedure not found")
	}

	return nil
}

// SearchProcedures searches procedures by title and content
func SearchProcedures(query string) ([]models.Procedure, error) {
	collection := config.GetCollection("procedures")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{
		"$or": []bson.M{
			{"title": bson.M{"$regex": query, "$options": "i"}},
			{"content": bson.M{"$regex": query, "$options": "i"}},
			{"description": bson.M{"$regex": query, "$options": "i"}},
		},
	}

	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var procedures []models.Procedure
	if err = cursor.All(ctx, &procedures); err != nil {
		return nil, err
	}

	return procedures, nil
}

// GetProceduresByCategory retrieves procedures by category
func GetProceduresByCategory(category string) ([]models.Procedure, error) {
	collection := config.GetCollection("procedures")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	filter := bson.M{"category": category}
	cursor, err := collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var procedures []models.Procedure
	if err = cursor.All(ctx, &procedures); err != nil {
		return nil, err
	}

	return procedures, nil
}
