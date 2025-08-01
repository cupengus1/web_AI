package main

import (
	"log"
	"os"

	"web_AI/config"
	"web_AI/routes"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// Load biến môi trường
	err := godotenv.Load()
	if err != nil {
		log.Fatal("❌ Không tìm thấy file .env")
	}

	// Kết nối MongoDB
	config.InitMongoDB()

	// Khởi tạo Gin và route
	router := gin.Default()
	routes.SetupRoutes(router)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Println("✅ Backend chạy tại http://localhost:" + port)
	router.Run(":" + port)
}
