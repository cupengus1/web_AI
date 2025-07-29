package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

// Struct request từ frontend
type AskRequest struct {
	Question string `json:"question"`
}

// Struct phản hồi gửi lại frontend
type AskResponse struct {
	Answer string `json:"answer"`
}

// Struct gọi Mistral API
type MistralRequest struct {
	Model    string           `json:"model"`
	Messages []MistralMessage `json:"messages"`
}

type MistralMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// Struct nhận từ Mistral API
type MistralResponse struct {
	Choices []struct {
		Message MistralMessage `json:"message"`
	} `json:"choices"`
}

func main() {
	// Load biến môi trường từ .env
	err := godotenv.Load()
	if err != nil {
		panic("❌ Thiếu file .env")
	}

	apiKey := os.Getenv("MISTRAL_API_KEY")
	if apiKey == "" {
		panic("❌ Thiếu MISTRAL_API_KEY trong .env")
	}

	router := gin.Default()

	// Thêm CORS middleware
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	router.POST("/ask", func(c *gin.Context) {
		var req AskRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
			return
		}

		answer, err := callMistralAPI(req.Question, apiKey)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi gọi Mistral: " + err.Error()})
			return
		}

		c.JSON(http.StatusOK, AskResponse{Answer: answer})
	})

	router.Run(":8080")
}

func callMistralAPI(question, apiKey string) (string, error) {
	// Body gửi tới Mistral
	reqBody := MistralRequest{
		Model: "mistral-large-latest", // hoặc model khác nếu bạn muốn
		Messages: []MistralMessage{
			{
				Role:    "user",
				Content: question,
			},
		},
	}

	jsonData, _ := json.Marshal(reqBody)

	req, err := http.NewRequest("POST", "https://api.mistral.ai/v1/chat/completions", bytes.NewBuffer(jsonData))
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

	bodyBytes, _ := io.ReadAll(resp.Body)

	if resp.StatusCode != 200 {
		return "", fmt.Errorf("Mistral trả về lỗi: %s", string(bodyBytes))
	}

	var res MistralResponse
	if err := json.Unmarshal(bodyBytes, &res); err != nil {
		return "", err
	}

	if len(res.Choices) > 0 {
		return res.Choices[0].Message.Content, nil
	}

	return "Không có phản hồi từ Mistral", nil
}
