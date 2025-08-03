// TODO: Authentication (login, register, logout)
package handlers

import (
	"net/http"
	"web_AI/services"
	"web_AI/utils"

	"github.com/gin-gonic/gin"
)

func Register(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	user, err := services.RegisterUser(req.Email, req.Password)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	token, _ := utils.GenerateJWT(user.ID.Hex())
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

	token, _ := utils.GenerateJWT(user.ID.Hex())
	c.JSON(http.StatusOK, gin.H{"user": user, "token": token})
}
//Sử dụng cho admin
func AdminLogin(c *gin.Context) {
	var req struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Dữ liệu không hợp lệ"})
		return
	}

	// Kiểm tra admin credentials (hardcoded cho demo)
	if req.Email == "admin@example.com" && req.Password == "123456" {
		token, _ := utils.GenerateJWT("admin")
		c.JSON(http.StatusOK, gin.H{"user": gin.H{"email": req.Email, "role": "admin"}, "token": token})
		return
	}

	c.JSON(http.StatusUnauthorized, gin.H{"error": "Email hoặc mật khẩu không đúng"})
}
