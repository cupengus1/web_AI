// TODO: Gọi Mistral API
package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
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

func CallMistralAPI(question string) (string, error) {
	return CallMistralAPIWithHistory("", question)
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
