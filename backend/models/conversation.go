// TODO: Conversation & Message models
package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Message struct {
	Role    string `bson:"role"`
	Content string `bson:"content"`
}

type Conversation struct {
	ID        primitive.ObjectID `bson:"_id,omitempty"`
	UserID    primitive.ObjectID `bson:"user_id"`
	Messages  []Message          `bson:"messages"`
	CreatedAt time.Time          `bson:"created_at"`
}
