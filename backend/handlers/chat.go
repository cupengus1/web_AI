package handlers

import (
	"net/http"
	"web_AI/models"
	"web_AI/services"

	"github.com/gin-gonic/gin"
)

func HandleAIChat(c *gin.Context) {
	var req models.AskRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	answer, err := services.CallMistralAPI(req.Question)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Lưu vào MongoDB
	_ = services.SaveConversation("anonymous", req.Question, answer) // Sau này thay bằng userID

	c.JSON(http.StatusOK, models.AskResponse{Answer: answer})
}
