// TODO: Logic nghiệp vụ user
package services

import (
	"context"
	"errors"
	"strings"
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

	// Set default role - check if email contains "admin"
	role := "user"
	if strings.Contains(email, "admin") {
		role = "admin"
	}

	user := models.User{
		ID:       primitive.NewObjectID(),
		Name:     name,
		Email:    email,
		Password: hashed,
		Role:     role,
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

// GetAllUsers trả về danh sách tất cả user (không trả về password)
func GetAllUsers() ([]models.User, error) {
	userCol := config.DB.Collection("users")
	cursor, err := userCol.Find(context.TODO(), bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(context.TODO())

	var users []models.User
	for cursor.Next(context.TODO()) {
		var user models.User
		if err := cursor.Decode(&user); err == nil {
			user.Password = "" // ẩn password
			users = append(users, user)
		}
	}
	return users, nil
}

// UpdateUser cập nhật thông tin user
func UpdateUser(id string, updateData models.User) error {
	userCol := config.DB.Collection("users")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID không hợp lệ")
	}

	// Không cho phép cập nhật password qua API này
	updateData.Password = ""

	update := bson.M{
		"$set": bson.M{
			"name":  updateData.Name,
			"email": updateData.Email,
			"role":  updateData.Role,
		},
	}

	result, err := userCol.UpdateOne(context.TODO(), bson.M{"_id": objID}, update)
	if err != nil {
		return err
	}
	if result.MatchedCount == 0 {
		return errors.New("Không tìm thấy user")
	}
	return nil
}

// DeleteUser xóa user theo ID
func DeleteUser(id string) error {
	userCol := config.DB.Collection("users")
	objID, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return errors.New("ID không hợp lệ")
	}

	result, err := userCol.DeleteOne(context.TODO(), bson.M{"_id": objID})
	if err != nil {
		return err
	}
	if result.DeletedCount == 0 {
		return errors.New("Không tìm thấy user")
	}
	return nil
}

// CreateUser tạo user mới (chỉ dành cho admin)
func CreateUser(user models.User) (*models.User, error) {
	userCol := config.DB.Collection("users")

	// Kiểm tra email đã tồn tại chưa
	var existing models.User
	err := userCol.FindOne(context.TODO(), bson.M{"email": user.Email}).Decode(&existing)
	if err == nil {
		return nil, errors.New("Email đã được sử dụng")
	}

	// Hash password nếu được cung cấp
	if user.Password != "" {
		hashed, err := utils.HashPassword(user.Password)
		if err != nil {
			return nil, err
		}
		user.Password = hashed
	}

	user.ID = primitive.NewObjectID()

	_, err = userCol.InsertOne(context.TODO(), user)
	if err != nil {
		return nil, err
	}

	user.Password = "" // Ẩn password trước khi trả về
	return &user, nil
}
