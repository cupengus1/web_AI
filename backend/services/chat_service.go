package services

import (
	"context"
	"fmt"
	"strings"
	"time"
	"web_AI/config"
	"web_AI/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// SaveChatConversation saves or updates a chat conversation
func SaveChatConversation(userIDStr, conversationID, userMessage, aiResponse string) (*models.ChatConversation, error) {
	collection := config.GetCollection("chat_conversations")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	// Create messages
	userMsg := models.ChatMessage{
		ID:        primitive.NewObjectID(),
		Role:      "user",
		Content:   userMessage,
		Timestamp: time.Now(),
	}

	aiMsg := models.ChatMessage{
		ID:        primitive.NewObjectID(),
		Role:      "assistant",
		Content:   aiResponse,
		Timestamp: time.Now(),
	}

	// If conversation exists, update it
	if conversationID != "" {
		convObjID, err := primitive.ObjectIDFromHex(conversationID)
		if err == nil {
			filter := bson.M{"_id": convObjID, "user_id": userObjID}
			update := bson.M{
				"$push": bson.M{"messages": bson.M{"$each": []models.ChatMessage{userMsg, aiMsg}}},
				"$set":  bson.M{"updated_at": time.Now()},
			}

			result, err := collection.UpdateOne(ctx, filter, update)
			if err == nil && result.ModifiedCount > 0 {
				// Return updated conversation
				var conversation models.ChatConversation
				err = collection.FindOne(ctx, filter).Decode(&conversation)
				return &conversation, err
			}
		}
	}

	// Create new conversation
	conversation := models.ChatConversation{
		ID:        primitive.NewObjectID(),
		UserID:    userObjID,
		Title:     generateConversationTitle(userMessage),
		Messages:  []models.ChatMessage{userMsg, aiMsg},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	_, err = collection.InsertOne(ctx, conversation)
	if err != nil {
		return nil, err
	}

	return &conversation, nil
}

// GetUserChatHistory retrieves chat history for a user
func GetUserChatHistory(userIDStr string) ([]models.ChatConversation, error) {
	collection := config.GetCollection("chat_conversations")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	filter := bson.M{"user_id": userObjID}
	opts := options.Find().SetSort(bson.D{bson.E{Key: "updated_at", Value: -1}}).SetLimit(50)

	cursor, err := collection.Find(ctx, filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	var conversations []models.ChatConversation
	if err = cursor.All(ctx, &conversations); err != nil {
		return nil, err
	}

	return conversations, nil
}

// GetChatConversation retrieves a specific conversation
func GetChatConversation(userIDStr, conversationID string) (*models.ChatConversation, error) {
	collection := config.GetCollection("chat_conversations")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID: %v", err)
	}

	convObjID, err := primitive.ObjectIDFromHex(conversationID)
	if err != nil {
		return nil, fmt.Errorf("invalid conversation ID: %v", err)
	}

	filter := bson.M{"_id": convObjID, "user_id": userObjID}
	var conversation models.ChatConversation
	err = collection.FindOne(ctx, filter).Decode(&conversation)
	if err != nil {
		return nil, err
	}

	return &conversation, nil
}

// DeleteChatConversation deletes a conversation
func DeleteChatConversation(userIDStr, conversationID string) error {
	collection := config.GetCollection("chat_conversations")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	userObjID, err := primitive.ObjectIDFromHex(userIDStr)
	if err != nil {
		return fmt.Errorf("invalid user ID: %v", err)
	}

	convObjID, err := primitive.ObjectIDFromHex(conversationID)
	if err != nil {
		return fmt.Errorf("invalid conversation ID: %v", err)
	}

	filter := bson.M{"_id": convObjID, "user_id": userObjID}
	_, err = collection.DeleteOne(ctx, filter)
	return err
}

// generateConversationTitle creates a title from the first message
func generateConversationTitle(firstMessage string) string {
	// Clean and truncate message
	title := strings.TrimSpace(firstMessage)
	if len(title) > 50 {
		title = title[:50] + "..."
	}

	// If empty, use default
	if title == "" {
		title = "Cuộc trò chuyện mới"
	}

	return title
}
