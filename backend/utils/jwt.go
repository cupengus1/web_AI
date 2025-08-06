// TODO: JWT utilities
package utils

import (
	"fmt"
	"os"
	"time"

	"github.com/golang-jwt/jwt/v4"
)

var jwtKey []byte

func getJWTKey() []byte {
	if len(jwtKey) == 0 {
		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			secret = "web-ai-super-secret-jwt-key-2025-production" // fallback
		}
		jwtKey = []byte(secret)
		fmt.Printf("🔍 JWT DEBUG - Loading JWT_SECRET: %s\n", secret[:10]+"...")
	}
	return jwtKey
}

func GenerateJWT(userID string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTKey())
}

func ValidateJWT(tokenString string) (string, error) {
	fmt.Printf("🔍 JWT DEBUG - Validating token: %s\n", tokenString[:20]+"...")
	fmt.Printf("🔍 JWT DEBUG - JWT_SECRET exists: %v\n", len(jwtKey) > 0)

	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return getJWTKey(), nil
	})

	if err != nil {
		fmt.Printf("🔍 JWT DEBUG - Parse error: %v\n", err)
		return "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if userID, ok := claims["user_id"].(string); ok {
			fmt.Printf("🔍 JWT DEBUG - Valid token for user: %s\n", userID)
			return userID, nil
		}
		return "", fmt.Errorf("invalid user_id in token")
	}

	return "", fmt.Errorf("invalid token")
}
