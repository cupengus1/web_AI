package handlers

import (
	"net/http"
	"web_AI/models"
	"web_AI/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func HandleAIChat(c *gin.Context) {
	var req models.AskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	// Lấy user ID từ JWT middleware (nếu có)
	var userID string
	if uid, exists := c.Get("user_id"); exists {
		if objID, ok := uid.(primitive.ObjectID); ok {
			userID = objID.Hex()
		}
	}

	answer, err := services.CallMistralAPIWithHistory(userID, req.Question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.AskResponse{Answer: answer})
}

func GetHistory(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	objID, ok := userID.(primitive.ObjectID)
	if !ok {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	conversations, err := services.GetConversations(objID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"conversations": conversations})
}
