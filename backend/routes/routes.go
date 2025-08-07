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

	// Public routes (no authentication required)
	router.GET("/api/procedures", handlers.GetProcedures)
	router.GET("/api/procedures/:id", handlers.GetProcedureById)
	router.GET("/api/procedures/search", handlers.SearchProcedures)
	router.GET("/api/procedures/category/:category", handlers.GetProceduresByCategory)
	router.GET("/api/categories", handlers.GetCategories)
	router.POST("/api/chat/public", handlers.HandleAIChat)
	router.POST("/api/chat/procedures", handlers.HandleProcedureAIChat) // New AI endpoint

	// Protected routes (require authentication)
	authGroup := router.Group("/api")
	authGroup.Use(middleware.JWTAuth())
	{
		authGroup.POST("/chat", handlers.HandleAIChat)
		authGroup.GET("/chat/history", handlers.GetChatHistory)
		authGroup.GET("/chat/conversations/:id", handlers.GetChatConversation)
		authGroup.DELETE("/chat/conversations/:id", handlers.DeleteChatConversation)
		authGroup.GET("/history", handlers.GetHistory)
	}

	// Admin protected routes (require admin role)
	adminGroup := router.Group("/api/admin")
	adminGroup.Use(middleware.AdminAuth())
	{
		// Procedure management
		adminGroup.POST("/procedures", handlers.CreateProcedure)
		adminGroup.PUT("/procedures/:id", handlers.UpdateProcedure)
		adminGroup.DELETE("/procedures/:id", handlers.DeleteProcedure)
		adminGroup.POST("/procedures/upload", handlers.UploadProcedureFile)

		// Category management
		adminGroup.POST("/categories", handlers.CreateCategory)

		// Statistics
		adminGroup.GET("/stats", handlers.GetAdminStats)
	}
}
