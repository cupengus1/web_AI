package handlers

import (
	"net/http"
	"os"
	"strings"
	"web_AI/models"
	"web_AI/services"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"

	pdf "github.com/ledongthuc/pdf"
	"github.com/unidoc/unioffice/document"
)

// GetProcedures handles GET /api/procedures
func GetProcedures(c *gin.Context) {
	category := c.Query("category")
	limit := int64(0) // No limit by default

	procedures, err := services.GetProcedures(category, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch procedures"})
		return
	}

	response := models.ProceduresResponse{
		Procedures: procedures,
		Total:      int64(len(procedures)),
	}

	c.JSON(http.StatusOK, response)
}

// GetProcedureById handles GET /api/procedures/:id
func GetProcedureById(c *gin.Context) {
	id := c.Param("id")

	procedure, err := services.GetProcedureByID(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, procedure)
}

// SearchProcedures handles GET /api/procedures/search
func SearchProcedures(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	procedures, err := services.SearchProcedures(query)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to search procedures"})
		return
	}

	response := models.ProceduresResponse{
		Procedures: procedures,
		Total:      int64(len(procedures)),
	}

	c.JSON(http.StatusOK, response)
}

// GetProceduresByCategory handles GET /api/procedures/category/:category
func GetProceduresByCategory(c *gin.Context) {
	category := c.Param("category")

	procedures, err := services.GetProceduresByCategory(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch procedures by category"})
		return
	}

	response := models.ProceduresResponse{
		Procedures: procedures,
		Total:      int64(len(procedures)),
	}

	c.JSON(http.StatusOK, response)
}

// CreateProcedure handles POST /api/admin/procedures
func CreateProcedure(c *gin.Context) {
	var req models.CreateProcedureRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get admin user ID from context (set by JWT middleware)
	var createdBy primitive.ObjectID
	if userID, exists := c.Get("user_id"); exists {
		if objID, ok := userID.(primitive.ObjectID); ok {
			createdBy = objID
		}
	}

	// Convert request to procedure model
	procedure := &models.Procedure{
		Title:       req.Title,
		Content:     req.Content,
		Category:    req.Category,
		Description: req.Description,
		CreatedBy:   createdBy,
	}

	err := services.CreateProcedure(procedure)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create procedure"})
		return
	}

	c.JSON(http.StatusCreated, procedure)
}

// UpdateProcedure handles PUT /api/admin/procedures/:id
func UpdateProcedure(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateProcedureRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Convert request to procedure model
	procedure := &models.Procedure{
		Title:       req.Title,
		Content:     req.Content,
		Category:    req.Category,
		Description: req.Description,
	}

	err := services.UpdateProcedure(id, procedure)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Get updated procedure to return
	updatedProcedure, err := services.GetProcedureByID(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get updated procedure"})
		return
	}

	c.JSON(http.StatusOK, updatedProcedure)
}

// DeleteProcedure handles DELETE /api/admin/procedures/:id
func DeleteProcedure(c *gin.Context) {
	id := c.Param("id")

	err := services.DeleteProcedure(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Procedure deleted successfully"})
}

// UploadProcedureFile handles POST /api/admin/procedures/upload
func UploadProcedureFile(c *gin.Context) {
	// Get form values
	title := c.PostForm("title")
	category := c.PostForm("category")

	if title == "" || category == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Title and category are required"})
		return
	}

	// Get uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File is required"})
		return
	}

	// Validate file type
	allowedTypes := map[string]bool{
		"application/pdf":    true,
		"application/msword": true,
		"application/vnd.openxmlformats-officedocument.wordprocessingml.document": true,
	}

	fileHeader := file.Header.Get("Content-Type")
	if !allowedTypes[fileHeader] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Only PDF and Word documents are allowed"})
		return
	}

	// Check file size (10MB limit)
	maxSize := int64(10 * 1024 * 1024) // 10MB
	if file.Size > maxSize {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size cannot exceed 10MB"})
		return
	}

	// Save file to uploads directory
	uploadDir := "uploads"
	if err := ensureDir(uploadDir); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not create upload directory"})
		return
	}
	filePath := uploadDir + "/" + file.Filename
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	// Trích xuất nội dung file nếu là PDF hoặc Word
	contentText := ""
	switch fileHeader {
	case "application/pdf":
		f, err := os.Open(filePath)
		if err == nil {
			defer f.Close()
			r, err := pdf.NewReader(f, file.Size)
			if err == nil {
				var sb strings.Builder
				n := r.NumPage()
				for i := 1; i <= n; i++ {
					p := r.Page(i)
					if p.V.IsNull() {
						continue
					}
					text, _ := p.GetPlainText(nil)
					// Xử lý: thêm khoảng trắng sau bullet, loại ký tự lạ, giữ xuống dòng
					text = strings.ReplaceAll(text, "", "\n- ")
					text = strings.ReplaceAll(text, "-[]", "- [ ] ")
					text = strings.ReplaceAll(text, "\u00a0", " ") // non-breaking space
					text = strings.ReplaceAll(text, "\u200b", "")  // zero-width space
					text = strings.ReplaceAll(text, "\n", "\n")    // giữ xuống dòng
					sb.WriteString(text)
				}
				contentText = sb.String()
			}
		}
	case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
		doc, err := document.Open(filePath)
		if err == nil {
			var sb strings.Builder
			for _, para := range doc.Paragraphs() {
				for _, run := range para.Runs() {
					sb.WriteString(run.Text())
				}
				sb.WriteString("\n")
			}
			contentText = sb.String()
		}
	}
	if contentText == "" {
		contentText = filePath // fallback: lưu đường dẫn file nếu không trích xuất được
	}
	procedure := &models.Procedure{
		Title:       title,
		Content:     contentText,
		Category:    category,
		Description: "File upload: " + file.Filename,
	}
	err = services.CreateProcedure(procedure)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save procedure info"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":   "File uploaded successfully",
		"procedure": procedure,
	})
}

// ensureDir creates the directory if not exists
func ensureDir(dirName string) error {
	if _, err := os.Stat(dirName); os.IsNotExist(err) {
		return os.MkdirAll(dirName, 0755)
	}
	return nil
}

// GetCategories handles GET /api/categories
func GetCategories(c *gin.Context) {
	categories, err := services.GetCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	response := models.CategoriesResponse{
		Categories: categories,
		Total:      int64(len(categories)),
	}

	c.JSON(http.StatusOK, response)
}

// CreateCategory handles POST /api/admin/categories
func CreateCategory(c *gin.Context) {
	var req models.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	category, err := services.CreateCategory(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, category)
}

// GetAdminStats handles GET /api/admin/stats
func GetAdminStats(c *gin.Context) {
	stats, err := services.GetAdminStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch stats"})
		return
	}

	c.JSON(http.StatusOK, stats)
}
