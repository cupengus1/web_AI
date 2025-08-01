package services

import (
	"context"
	"time"
	"web_AI/config"
	"web_AI/models"
)

func SaveConversation(userID, question, answer string) error {
	collection := config.DB.Collection("conversations")

	convo := models.Conversation{
		UserID:    userID,
		Question:  question,
		Answer:    answer,
		Timestamp: time.Now(),
	}

	_, err := collection.InsertOne(context.Background(), convo)
	return err
}
