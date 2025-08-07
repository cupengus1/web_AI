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

func GenerateJWT(userID string, role string) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"role":    role,
		"exp":     time.Now().Add(time.Hour * 72).Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(getJWTKey())
}

func ValidateJWT(tokenString string) (string, string, error) {
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
		return "", "", err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		userID, userIDOk := claims["user_id"].(string)
		role, roleOk := claims["role"].(string)

		if userIDOk {
			if !roleOk {
				role = "user" // default role if not specified
			}
			fmt.Printf("🔍 JWT DEBUG - Valid token for user: %s, role: %s\n", userID, role)
			return userID, role, nil
		}
		return "", "", fmt.Errorf("invalid user_id in token")
	}

	return "", "", fmt.Errorf("invalid token")
}
