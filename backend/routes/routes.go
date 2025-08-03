// TODO: Định nghĩa các API routes
package routes

import (
	"web_AI/handlers"
	"web_AI/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Auth routes
	router.POST("/api/auth/register", handlers.Register)
	router.POST("/api/auth/login", handlers.Login)
	
	// Admin routes
	router.POST("/api/admin/login", handlers.AdminLogin)

	// Protected routes
	authGroup := router.Group("/api")
	authGroup.Use(middleware.JWTAuth())
	{
		authGroup.POST("/chat", handlers.HandleAIChat)
		authGroup.GET("/history", handlers.GetHistory)
	}

	// Public chat route (không cần đăng nhập)
	router.POST("/api/chat/public", handlers.HandleAIChat)
}
