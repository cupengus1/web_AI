// AI Service with RAG (Retrieval-Augmented Generation)
package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"sync"
	"time"

	"web_AI/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// Simple rate limiter
var (
	lastRequestTime time.Time
	requestMutex    sync.Mutex
)

// CallMistralAPI calls the AI with basic question
func CallMistralAPI(question string) (string, error) {
	return CallMistralAPIWithHistory("", question)
}

// CallMistralAPIWithRAG calls AI with relevant procedures context
func CallMistralAPIWithRAG(userID string, question string) (string, error) {
	// 1. Search for relevant procedures based on question
	relevantProcedures, err := SearchProcedures(question)
	if err != nil {
		fmt.Printf("🔍 RAG Search Error: %v\n", err)
		// Fallback to normal AI call if search fails
		return CallMistralAPIWithHistory(userID, question)
	}

	// 2. Build context from relevant procedures
	context := buildProcedureContext(relevantProcedures)

	// 3. Create enhanced prompt with context
	enhancedQuestion := buildRAGPrompt(context, question)

	fmt.Printf("🤖 RAG Enhanced Question: %s\n", enhancedQuestion[:200]+"...")

	// 4. Call AI with enhanced context
	return CallMistralAPIWithHistory(userID, enhancedQuestion)
}

// buildProcedureContext creates context string from procedures
func buildProcedureContext(procedures []models.Procedure) string {
	if len(procedures) == 0 {
		return "Không tìm thấy quy trình liên quan."
	}

	var contextBuilder strings.Builder
	contextBuilder.WriteString("🔍 Thông tin quy trình liên quan:\n\n")

	for i, procedure := range procedures {
		if i >= 5 { // Limit to top 5 relevant procedures
			break
		}

		contextBuilder.WriteString(fmt.Sprintf("**%d. %s** (Danh mục: %s)\n", i+1, procedure.Title, procedure.Category))

		if procedure.Description != "" {
			contextBuilder.WriteString(fmt.Sprintf("Mô tả: %s\n", procedure.Description))
		}

		// Truncate content if too long
		content := procedure.Content
		if len(content) > 500 {
			content = content[:500] + "..."
		}
		contextBuilder.WriteString(fmt.Sprintf("Nội dung:\n%s\n\n", content))
	}

	return contextBuilder.String()
}

// buildRAGPrompt creates enhanced prompt with context
func buildRAGPrompt(context string, question string) string {
	systemPrompt := `Bạn là AI Assistant cho hệ thống quản lý quy trình nội bộ của công ty. 
Nhiệm vụ của bạn là trả lời câu hỏi dựa trên thông tin quy trình được cung cấp.

HƯỚNG DẪN TRẢ LỜI:
1. Ưu tiên sử dụng thông tin từ quy trình được cung cấp
2. Trả lời bằng tiếng Việt, rõ ràng và chi tiết
3. Nếu không có thông tin liên quan, hãy thông báo và đưa ra gợi ý chung
4. Luôn thân thiện và hỗ trợ tối đa

THÔNG TIN QUY TRÌNH:
` + context + `

---

CÂU HỎI: ` + question + `

TRẢ LỜI:`

	return systemPrompt
}

func CallMistralAPIWithHistory(userID string, question string) (string, error) {
	apiKey := os.Getenv("MISTRAL_API_KEY")
	if apiKey == "" {
		return "", fmt.Errorf("thiếu MISTRAL_API_KEY")
	}

	// Rate limiting: wait at least 1 second between requests
	requestMutex.Lock()
	timeSinceLastRequest := time.Since(lastRequestTime)
	if timeSinceLastRequest < time.Second {
		time.Sleep(time.Second - timeSinceLastRequest)
	}
	lastRequestTime = time.Now()
	requestMutex.Unlock()

	// Try different models in order of preference
	modelsToTry := []string{"mistral-small-latest", "open-mistral-7b", "open-mixtral-8x7b", "mistral-large-latest"}

	var lastError error

	for _, model := range modelsToTry {
		fmt.Printf("Trying model: %s\n", model)

		reqBody := models.MistralRequest{
			Model: model,
			Messages: []models.MistralMessage{
				{Role: "user", Content: question},
			},
		}

		jsonData, _ := json.Marshal(reqBody)

		req, err := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonData))
		if err != nil {
			lastError = err
			continue
		}

		req.Header.Set("Authorization", "Bearer "+apiKey)
		req.Header.Set("Content-Type", "application/json")

		client := &http.Client{Timeout: 30 * time.Second}
		resp, err := client.Do(req)
		if err != nil {
			lastError = err
			continue
		}
		defer resp.Body.Close()

		bodyBytes, _ := io.ReadAll(resp.Body)

		if resp.StatusCode != 200 {
			var errorResp models.MistralResponse
			json.Unmarshal(bodyBytes, &errorResp)

			if errorResp.Error != nil {
				// If it's a capacity error, try the next model
				if errorResp.Error.Code == "3505" {
					fmt.Printf("Model %s has capacity issues, trying next model...\n", model)
					lastError = fmt.Errorf("model %s: %s", model, errorResp.Error.Message)
					continue
				}
			}

			lastError = fmt.Errorf("mistral API error (Status %d): %s", resp.StatusCode, string(bodyBytes))
			continue
		}

		var res models.MistralResponse
		if err := json.Unmarshal(bodyBytes, &res); err != nil {
			lastError = err
			continue
		}

		if len(res.Choices) > 0 {
			answer := res.Choices[0].Message.Content
			fmt.Printf("Successfully got response from model: %s\n", model)

			// Lưu lịch sử nếu có userID
			if userID != "" {
				if objID, err := primitive.ObjectIDFromHex(userID); err == nil {
					if err := SaveConversation(objID, question, answer); err != nil {
						fmt.Printf("Error saving conversation: %v\n", err)
					}
				}
			}

			return answer, nil
		}
	}

	// If all models failed, return the last error
	if lastError != nil {
		return "", fmt.Errorf("all models failed. Last error: %v", lastError)
	}

	return "", fmt.Errorf("no response from any Mistral model")
}
