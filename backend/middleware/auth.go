package middleware

import (
	"fmt"
	"net/http"
	"strings"
	"web_AI/utils"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		// Format: "Bearer <token>"
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		token := tokenParts[1]
		fmt.Printf("🔍 MIDDLEWARE DEBUG - Token received: %s\n", token[:20]+"...")

		userID, err := utils.ValidateJWT(token)
		if err != nil {
			fmt.Printf("🔍 MIDDLEWARE DEBUG - JWT validation failed: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		fmt.Printf("🔍 MIDDLEWARE DEBUG - JWT validation success, userID: %s\n", userID)

		// Convert string to ObjectID hoặc handle admin special case
		if userID == "admin" {
			// Special case cho admin
			c.Set("user_id", userID)
			c.Set("is_admin", true)
		} else {
			objID, err := primitive.ObjectIDFromHex(userID)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
				c.Abort()
				return
			}
			c.Set("user_id", objID)
		}
		c.Next()
	}
}
