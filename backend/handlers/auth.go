// TODO: Authentication (login, register, logout)
package handlers

import (
	"fmt"
	"net/http"
	"web_AI/services"
	"web_AI/utils"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var req struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	// DEBUG: Log received data
	fmt.Printf("📝 REGISTER DEBUG - Received: Name='%s', Email='%s', Password='%s'\n",
		req.Name, req.Email, req.Password)

	user, err := services.RegisterUser(req.Name, req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	// DEBUG: Log created user
	fmt.Printf("✅ USER CREATED - Name='%s', Email='%s'\n", user.Name, user.Email)

	token, _ := utils.GenerateJWT(user.ID.Hex(), user.Role)
	c.JSON(http.StatusOK, gin.H{"user": user, "token": token})
}

func Login(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	user, err := services.LoginUser(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	token, _ := utils.GenerateJWT(user.ID.Hex(), user.Role)
	c.JSON(http.StatusOK, gin.H{"user": user, "token": token})
}
