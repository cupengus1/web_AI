// TODO: Chat với AI (ask, history, new conversation)
package handlers

import (
	"net/http"

	"your_project_name/models"
	"your_project_name/services"

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
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi gọi Mistral: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, models.AskResponse{Answer: answer})
}
