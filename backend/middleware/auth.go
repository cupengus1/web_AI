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

		userID, role, err := utils.ValidateJWT(token)
		if err != nil {
			fmt.Printf("🔍 MIDDLEWARE DEBUG - JWT validation failed: %v\n", err)
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		fmt.Printf("🔍 MIDDLEWARE DEBUG - JWT validation success, userID: %s, role: %s\n", userID, role)

		// Set user context
		if userID == "admin" || role == "admin" {
			// Admin user
			c.Set("user_id", userID)
			c.Set("role", "admin")
			c.Set("is_admin", true)
		} else {
			objID, err := primitive.ObjectIDFromHex(userID)
			if err != nil {
				c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
				c.Abort()
				return
			}
			c.Set("user_id", objID)
			c.Set("role", role)
			c.Set("is_admin", role == "admin")
		}
		c.Next()
	}
}

// AdminAuth middleware - requires admin role
func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		// First run JWT auth
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Authorization header required"})
			c.Abort()
			return
		}

		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid authorization format"})
			c.Abort()
			return
		}

		token := tokenParts[1]
		userID, role, err := utils.ValidateJWT(token)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		// Check if user has admin role
		if role != "admin" {
			c.JSON(http.StatusForbidden, gin.H{"error": "Admin access required"})
			c.Abort()
			return
		}

		// Set admin context
		c.Set("user_id", userID)
		c.Set("role", "admin")
		c.Set("is_admin", true)
		c.Next()
	}
}
