package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Procedure struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title       string             `bson:"title" json:"title"`
	Content     string             `bson:"content" json:"content"`
	Category    string             `bson:"category" json:"category"`
	Description string             `bson:"description" json:"description"`
	FileURL     string             `bson:"file_url,omitempty" json:"file_url,omitempty"`
	FileName    string             `bson:"file_name,omitempty" json:"file_name,omitempty"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
	CreatedBy   primitive.ObjectID `bson:"created_by,omitempty" json:"created_by,omitempty"`
}

type Category struct {
	ID          primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Name        string             `bson:"name" json:"name"`
	Description string             `bson:"description" json:"description"`
	CreatedAt   time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt   time.Time          `bson:"updated_at" json:"updated_at"`
}

// Request/Response models
type CreateProcedureRequest struct {
	Title       string `json:"title" binding:"required"`
	Content     string `json:"content" binding:"required"`
	Category    string `json:"category" binding:"required"`
	Description string `json:"description"`
}

type UpdateProcedureRequest struct {
	Title       string `json:"title"`
	Content     string `json:"content"`
	Category    string `json:"category"`
	Description string `json:"description"`
}

type CreateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description" binding:"required"`
}

type ProceduresResponse struct {
	Procedures []Procedure `json:"procedures"`
	Total      int64       `json:"total"`
}

type CategoriesResponse struct {
	Categories []Category `json:"categories"`
	Total      int64      `json:"total"`
}

type AdminStatsResponse struct {
	TotalProcedures int64 `json:"totalProcedures"`
	TotalCategories int64 `json:"totalCategories"`
	TotalVisits     int64 `json:"totalVisits"`
}
