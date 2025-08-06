// TODO: Logic nghiệp vụ user
package services

import (
	"context"
	"errors"
	"web_AI/config"
	"web_AI/models"
	"web_AI/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func RegisterUser(name, email, password string) (*models.User, error) {
	userCol := config.DB.Collection("users")

	// Kiểm tra email đã tồn tại chưa
	var existing models.User
	err := userCol.FindOne(context.TODO(), bson.M{"email": email}).Decode(&existing)
	if err == nil {
		return nil, errors.New("Email đã được sử dụng")
	}

	hashed, _ := utils.HashPassword(password)
	user := models.User{
		ID:       primitive.NewObjectID(),
		Name:     name,
		Email:    email,
		Password: hashed,
	}

	_, err = userCol.InsertOne(context.TODO(), user)
	if err != nil {
		return nil, err
	}

	user.Password = "" // Ẩn password trả về
	return &user, nil
}

func LoginUser(email, password string) (*models.User, error) {
	userCol := config.DB.Collection("users")

	var user models.User
	err := userCol.FindOne(context.TODO(), bson.M{"email": email}).Decode(&user)
	if err != nil {
		return nil, errors.New("Email không tồn tại")
	}

	if !utils.CheckPasswordHash(password, user.Password) {
		return nil, errors.New("Sai mật khẩu")
	}

	user.Password = ""
	return &user, nil
}
