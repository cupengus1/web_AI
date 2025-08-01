// TODO: Kết nối MongoDB
package config

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var DB *mongo.Database

func ConnectMongo() {
	mongoURI := os.Getenv("MONGO_URI")
	dbName := os.Getenv("MONGO_DB_NAME")

	clientOpts := options.Client().ApplyURI(mongoURI)
	client, err := mongo.NewClient(clientOpts)
	if err != nil {
		log.Fatal("❌ Tạo MongoDB client thất bại:", err)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	err = client.Connect(ctx)
	if err != nil {
		log.Fatal("❌ Kết nối MongoDB thất bại:", err)
	}

	// Ping thử để chắc chắn kết nối thành công
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("❌ Không thể ping MongoDB:", err)
	}

	DB = client.Database(dbName)
	fmt.Println("✅ Kết nối MongoDB thành công!")
}
