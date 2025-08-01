package services

import (
	"context"
	"time"
	"web_AI/config"
	"web_AI/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func SaveConversation(userID primitive.ObjectID, question, answer string) error {
	collection := config.DB.Collection("conversations")

	// Tìm conversation gần nhất của user (trong vòng 1 giờ)
	filter := bson.M{
		"user_id": userID,
		"created_at": bson.M{
			"$gte": time.Now().Add(-1 * time.Hour),
		},
	}

	var existingConvo models.Conversation
	err := collection.FindOne(context.Background(), filter, options.FindOne().SetSort(bson.M{"created_at": -1})).Decode(&existingConvo)

	if err == nil {
		// Nếu có conversation gần đây, thêm message vào conversation đó
		existingConvo.Messages = append(existingConvo.Messages,
			models.Message{Role: "user", Content: question},
			models.Message{Role: "assistant", Content: answer},
		)

		filter := bson.M{"_id": existingConvo.ID}
		update := bson.M{"$set": bson.M{"messages": existingConvo.Messages}}
		_, err = collection.UpdateOne(context.Background(), filter, update)
		return err
	} else {
		// Tạo conversation mới
		newConvo := models.Conversation{
			UserID: userID,
			Messages: []models.Message{
				{Role: "user", Content: question},
				{Role: "assistant", Content: answer},
			},
			CreatedAt: time.Now(),
		}

		_, err = collection.InsertOne(context.Background(), newConvo)
		return err
	}
}

func GetConversations(userID primitive.ObjectID) ([]models.Conversation, error) {
	collection := config.DB.Collection("conversations")

	filter := bson.M{"user_id": userID}
	opts := options.Find().SetSort(bson.M{"created_at": -1}).SetLimit(50)

	cursor, err := collection.Find(context.Background(), filter, opts)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.Background())

	var conversations []models.Conversation
	if err = cursor.All(context.Background(), &conversations); err != nil {
		return nil, err
	}

	return conversations, nil
}
