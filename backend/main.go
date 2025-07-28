package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Cấu trúc nhận từ frontend
type AskRequest struct {
	Question string `json:"question"`
}

// Cấu trúc gửi lại frontend
type AskResponse struct {
	Answer string `json:"answer"`
}

// Cấu trúc request gửi AIMLAPI
type AIMLAPIRequest struct {
	Model    string         `json:"model"`
	Messages []MessageEntry `json:"messages"`
}

type MessageEntry struct {
	Role    string `json:"role"` // Chỉ được "user" hoặc "assistant"
	Content string `json:"content"`
}

// Cấu trúc phản hồi từ AIMLAPI
type AIMLAPIResponse struct {
	Choices []struct {
		Message MessageEntry `json:"message"`
	} `json:"choices"`
	Error *struct {
		Message string `json:"message"`
		Code    any    `json:"code"`
	} `json:"error,omitempty"`
}

func main() {
	err := godotenv.Load()
	if err != nil {
		panic("❌ Không thể đọc file .env")
	}

	apiKey := os.Getenv("AIML_API_KEY")
	if apiKey == "" {
		panic("❌ Thiếu AIML_API_KEY trong .env")
	}

	r := gin.Default()

	r.POST("/ask", func(c *gin.Context) {
		var req AskRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Yêu cầu không hợp lệ"})
			return
		}

		answer, err := callAIMLAPI(req.Question, apiKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		c.JSON(http.StatusOK, AskResponse{Answer: answer})
	})

	r.Run(":8080")
}

func callAIMLAPI(question, apiKey string) (string, error) {
	reqBody := AIMLAPIRequest{
		Model: "google/gemma-3n-e4b-it",
		Messages: []MessageEntry{
			{
				Role:    "user",
				Content: "Bạn là trợ lý AI hỗ trợ trả lời các quy trình nội bộ. " + question,
			},
		},
	}

	jsonData, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("Không thể mã hóa JSON: %v", err)
	}

	req, err := http.NewRequest("POST", "https://api.aimlapi.com/v1/chat/completions", bytes.NewBuffer(jsonData))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, _ := ioutil.ReadAll(resp.Body)
	fmt.Println("AIMLAPI Raw Response:", string(body))

	var res AIMLAPIResponse
	if err := json.Unmarshal(body, &res); err != nil {
		return "", fmt.Errorf("Không thể phân tích phản hồi AIMLAPI: %v", err)
	}

	if res.Error != nil {
		return "", fmt.Errorf("Lỗi AIMLAPI: %v", string(body))
	}

	if len(res.Choices) > 0 {
		return res.Choices[0].Message.Content, nil
	}

	return "Không có phản hồi từ AI", nil
}
