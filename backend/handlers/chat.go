package handlers

import (
	"fmt"
	"net/http"
	"web_AI/models"
	"web_AI/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

// HandleAIChat handles AI chat with optional conversation persistence
func HandleAIChat(c *gin.Context) {
	var req models.ChatRequest
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

	// 🤖 Use RAG-enhanced AI call
	answer, err := services.CallMistralAPIWithRAG(userID, req.Message)
	if err != nil {
		// Fallback to basic AI call if RAG fails
		fmt.Printf("🔄 RAG failed, falling back to basic AI: %v\n", err)
		answer, err = services.CallMistralAPIWithHistory(userID, req.Message)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
	}

	// 💾 Save conversation if user is authenticated
	var conversation *models.ChatConversation
	if userID != "" {
		conversation, err = services.SaveChatConversation(userID, req.ConversationID, req.Message, answer)
		if err != nil {
			fmt.Printf("🔄 Failed to save conversation: %v\n", err)
			// Don't fail the request if we can't save conversation
		}
	}

	response := models.ChatResponse{
		Response: answer,
	}

	if conversation != nil {
		response.ConversationID = conversation.ID.Hex()
		response.Conversation = conversation
	}

	c.JSON(http.StatusOK, response)
}

// GetChatHistory retrieves user's chat history
func GetChatHistory(c *gin.Context) {
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

	conversations, err := services.GetUserChatHistory(objID.Hex())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := models.ChatHistoryResponse{
		Conversations: conversations,
		Total:         int64(len(conversations)),
	}

	c.JSON(http.StatusOK, response)
}

// GetChatConversation retrieves a specific conversation
func GetChatConversation(c *gin.Context) {
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

	conversationID := c.Param("id")
	conversation, err := services.GetChatConversation(objID.Hex(), conversationID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Conversation not found"})
		return
	}

	c.JSON(http.StatusOK, conversation)
}

// DeleteChatConversation deletes a conversation
func DeleteChatConversation(c *gin.Context) {
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

	conversationID := c.Param("id")
	err := services.DeleteChatConversation(objID.Hex(), conversationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Conversation deleted successfully"})
}

// HandleProcedureAIChat handles AI questions specifically about procedures
func HandleProcedureAIChat(c *gin.Context) {
	var req struct {
		Question    string `json:"question" binding:"required"`
		ProcedureID string `json:"procedure_id,omitempty"`
	}

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

	var answer string
	var err error

	// If specific procedure ID provided, get that procedure
	if req.ProcedureID != "" {
		procedure, procErr := services.GetProcedureByID(req.ProcedureID)
		if procErr != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy quy trình"})
			return
		}

		// Create specific prompt for this procedure
		specificPrompt := fmt.Sprintf(`Dựa trên quy trình "%s" sau:

**Tiêu đề:** %s
**Danh mục:** %s  
**Mô tả:** %s
**Nội dung:**
%s

---

**Câu hỏi:** %s

Hãy trả lời câu hỏi dựa trên thông tin quy trình trên.`,
			procedure.Title, procedure.Title, procedure.Category,
			procedure.Description, procedure.Content, req.Question)

		answer, err = services.CallMistralAPIWithHistory(userID, specificPrompt)
	} else {
		// Use RAG for general procedure questions
		answer, err = services.CallMistralAPIWithRAG(userID, req.Question)
	}

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
