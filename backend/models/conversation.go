// TODO: Conversation & Message models
package models

import "time"

type Conversation struct {
	UserID    string    `bson:"user_id"`
	Question  string    `bson:"question"`
	Answer    string    `bson:"answer"`
	Timestamp time.Time `bson:"timestamp"`
}
