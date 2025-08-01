# Backend Structure

## 📁 Cấu trúc thư mục:

```
backend/
├── main.go                    # Entry point của ứng dụng
├── go.mod                     # Go modules
├── go.sum                     # Dependencies checksum
├── .env                       # Environment variables
├── .env.example               # Template cho .env
│
├── config/                    # Cấu hình
│   ├── config.go             # Load cấu hình từ .env và JSON
│   ├── database.go           # Kết nối MongoDB
│   └── config.json           # Cấu hình API và các settings
│
├── models/                    # Data models
│   ├── user.go               # User model (ID, Email, Password, etc.)
│   └── conversation.go       # Conversation & Message models
│
├── handlers/                  # HTTP handlers
│   ├── auth.go               # Authentication (login, register, logout)
│   ├── chat.go               # Chat với AI (ask, history, new conversation)
│   └── user.go               # User profile management
│
├── middleware/                # Middleware functions
│   └── auth.go               # JWT authentication middleware
│
├── services/                  # Business logic
│   ├── ai_service.go         # Gọi Mistral API
│   └── user_service.go       # Logic nghiệp vụ user
│
├── utils/                     # Utilities
│   ├── jwt.go                # JWT utilities
│   └── response.go           # Chuẩn hóa API response
│
└── routes/                    # Route definitions
    └── routes.go             # Định nghĩa các API routes
```

## 🎯 Mục đích từng thư mục:

### **config/**
- Quản lý cấu hình ứng dụng
- Kết nối database
- Load environment variables

### **models/**
- Định nghĩa cấu trúc dữ liệu
- MongoDB schema
- Validation rules

### **handlers/**
- Xử lý HTTP requests
- Parse request data
- Call services
- Return responses

### **middleware/**
- Authentication/Authorization
- Logging
- CORS
- Rate limiting

### **services/**
- Business logic
- Database operations
- External API calls
- Data processing

### **utils/**
- Helper functions
- Common utilities
- Reusable components

### **routes/**
- API route definitions
- Route grouping
- Middleware assignment

## 📋 TODO:
- [ ] Implement models
- [ ] Setup MongoDB connection
- [ ] Create JWT utilities
- [ ] Build authentication handlers
- [ ] Migrate existing Mistral API code
- [ ] Add database operations
- [ ] Create API documentation
