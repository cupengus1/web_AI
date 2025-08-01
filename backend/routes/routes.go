// TODO: Định nghĩa các API routes
package routes

import (
	"web_AI/handlers"
	"web_AI/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.Use(middleware.CORSMiddleware())
	router.POST("/ask", handlers.HandleAIChat)
}
