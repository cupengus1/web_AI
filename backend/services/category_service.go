package services

import (
	"context"
	"fmt"
	"time"
	"web_AI/config"
	"web_AI/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetCategories retrieves all categories from database
func GetCategories() ([]models.Category, error) {
	collection := config.GetCollection("categories")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	cursor, err := collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var categories []models.Category
	if err = cursor.All(ctx, &categories); err != nil {
		return nil, err
	}

	return categories, nil
}

// CreateCategory creates a new category
func CreateCategory(req models.CreateCategoryRequest) (*models.Category, error) {
	collection := config.GetCollection("categories")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Check if category name already exists
	var existingCategory models.Category
	err := collection.FindOne(ctx, bson.M{"name": req.Name}).Decode(&existingCategory)
	if err == nil {
		return nil, fmt.Errorf("category with name '%s' already exists", req.Name)
	} else if err != mongo.ErrNoDocuments {
		return nil, err
	}

	category := models.Category{
		ID:          primitive.NewObjectID(),
		Name:        req.Name,
		Description: req.Description,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	_, err = collection.InsertOne(ctx, category)
	if err != nil {
		return nil, err
	}

	return &category, nil
}

// GetAdminStats returns statistics for admin dashboard
func GetAdminStats() (*models.AdminStatsResponse, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	proceduresCollection := config.GetCollection("procedures")
	categoriesCollection := config.GetCollection("categories")

	// Count procedures
	proceduresCount, err := proceduresCollection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	// Count categories
	categoriesCount, err := categoriesCollection.CountDocuments(ctx, bson.M{})
	if err != nil {
		return nil, err
	}

	// For visits, we'll use a simple counter (you could implement a more sophisticated tracking)
	totalVisits := int64(0) // This could be stored in a separate collection

	stats := &models.AdminStatsResponse{
		TotalProcedures: proceduresCount,
		TotalCategories: categoriesCount,
		TotalVisits:     totalVisits,
	}

	return stats, nil
}
