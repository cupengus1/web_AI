package models

type AskRequest struct {
	Question string `json:"question"`
}

type AskResponse struct {
	Answer string `json:"answer"`
}

type MistralRequest struct {
	Model    string           `json:"model"`
	Messages []MistralMessage `json:"messages"`
}

type MistralMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type MistralResponse struct {
	Choices []struct {
		Message MistralMessage `json:"message"`
	} `json:"choices"`
	Error *MistralError `json:"error,omitempty"`
}

type MistralError struct {
	Message string `json:"message"`
	Type    string `json:"type"`
	Code    string `json:"code"`
}
