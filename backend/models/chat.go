package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ChatMessage struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Role      string             `bson:"role" json:"role"` // "user" or "assistant"
	Content   string             `bson:"content" json:"content"`
	Timestamp time.Time          `bson:"timestamp" json:"timestamp"`
}

type ChatConversation struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	UserID    primitive.ObjectID `bson:"user_id" json:"user_id"`
	Title     string             `bson:"title" json:"title"`
	Messages  []ChatMessage      `bson:"messages" json:"messages"`
	CreatedAt time.Time          `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time          `bson:"updated_at" json:"updated_at"`
}

// Request/Response models for Chat API
type ChatRequest struct {
	ConversationID string `json:"conversation_id,omitempty"`
	Message        string `json:"message" binding:"required"`
}

type ChatResponse struct {
	ConversationID string            `json:"conversation_id"`
	Conversation   *ChatConversation `json:"conversation,omitempty"`
	Response       string            `json:"response"`
}

type ChatHistoryResponse struct {
	Conversations []ChatConversation `json:"conversations"`
	Total         int64              `json:"total"`
}
