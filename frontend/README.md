# Internal Process Management AI System - Frontend

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 trở lên)
- Go (v1.19 trở lên) 
- MongoDB

### Installation & Setup
```bash
# 1. Clone repository
git clone [repository-url]
cd web_AI

# 2. Setup Backend
cd backend
go mod tidy
go run main.go  # Server: http://localhost:8080

# 3. Setup Frontend (terminal mới)
cd frontend
npm install
npm start       # App: http://localhost:3000
```

### Test Login Credentials
- **Admin**: admin@example.com / 123456
- **User**: user1@gmail.com / 12345678

---

📁 Cấu trúc chi tiết src/
src/
├── 📄 index.css                 # Global CSS styles
├── 📄 index.js                  # Entry point của ứng dụng
│
├── 📁 features/                 # Các tính năng chính (Feature-based Architecture)
│   │
│   ├── 📁 admin/               # Tính năng quản trị
│   │   ├── 📁 components/      # Components riêng cho admin
│   │   └── 📁 pages/          
│   │       ├── AdminDashboard.css
│   │       └── AdminDashboard.js
│   │
│   ├── 📁 auth/               # Tính năng xác thực
│   │   ├── 📁 components/     # Components riêng cho auth
│   │   └── 📁 pages/
│   │       ├── SignInPage.css
│   │       ├── SignInPage.js
│   │       └── SignInPage.styles.css
│   │
│   ├── 📁 chat/               # Tính năng chat với AI
│   │   ├── 📁 components/
│   │   │   ├── ChatList.css
│   │   │   ├── ChatList.js
│   │   │   ├── newPrompt.css
│   │   │   └── NewPrompt.js
│   │   └── 📁 pages/
│   │       ├── ChatPage.css
│   │       └── ChatPage.js
│   │
│   ├── 📁 dashboard/          # Trang chủ/Dashboard
│   │   ├── 📁 components/     # Components riêng cho dashboard
│   │   └── 📁 pages/
│   │       ├── DashboardPage.css
│   │       └── DashboardPage.js
│   │
│   └── 📁 procedures/         # Tính năng quản lý quy trình
│       ├── 📁 components/     # Components riêng cho procedures
│       └── 📁 pages/
│           ├── ProceduresPage.css
│           └── ProceduresPage.js
│
└── 📁 shared/                 # Các thành phần dùng chung
    │
    ├── 📁 api/               # API calls và services
    │   └── api.js
    │
    ├── 📁 components/        # Components dùng chung
    │   ├── admin.js          # Component admin cũ
    │   ├── login.js          # Component login dùng chung
    │   ├── user.js           # Component user cũ
    │   │
    │   ├── 📁 chatList/      # Component ChatList
    │   │   ├── chatList.css
    │   │   └── ChatList.js
    │   │
    │   └── 📁 newPrompt/     # Component NewPrompt
    │       ├── newPrompt.css
    │       └── NewPrompt.js
    │
    └── 📁 layouts/           # Layout components
        ├── rootLayout.css
        └── RootLayout.js

🎯 Ý nghĩa từng thư mục:
  features/ - Feature-based Architecture
  admin/: Quản lý hệ thống, CRUD quy trình
  auth/: Đăng nhập, đăng ký, xác thực
  chat/: Trò chuyện với AI, lịch sử chat
  dashboard/: Trang chủ, tổng quan hệ thống
  procedures/: Quản lý quy trình nội bộ
  shared/ - Shared Resources
  api/: Kết nối API, HTTP requests
  components/: Components tái sử dụng
  layouts/: Layout chung cho toàn app

📊 Thống kê:
  Tổng files: 25 files
  Features: 5 tính năng chính
  Components: 8 components
  CSS files: 12 files
  JS files: 13 files

## 🔗 Kết nối Backend và Frontend

### 1. Cấu hình Backend (Go Server)
```bash
# Khởi động backend Go server
cd backend
go run main.go
# Server sẽ chạy tại: http://localhost:8080
```

### 2. Cấu hình Frontend (React App)
```bash
# Khởi động frontend React app
cd frontend
npm start
# App sẽ chạy tại: http://localhost:3000
```

### 3. Proxy Configuration
Trong `frontend/package.json` đã được cấu hình proxy:
```json
{
  "name": "demo-react",
  "proxy": "http://localhost:8080",
  "dependencies": {
    // ...
  }
}
```

### 4. API Endpoints
File `src/shared/api/api.js` quản lý tất cả API calls:

#### Authentication APIs
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/logout` - Đăng xuất

#### AI Chat APIs
- `POST /api/ai/ask` - Hỏi AI
- `POST /api/chat/public` - Chat công khai
- `POST /api/ai/chat-with-context` - Chat với context

#### Admin APIs
- `GET /api/admin/stats` - Thống kê admin
- `POST /api/admin/procedures` - Tạo quy trình
- `PUT /api/admin/procedures/:id` - Cập nhật quy trình
- `DELETE /api/admin/procedures/:id` - Xóa quy trình

### 5. Authentication Flow
```javascript
// 1. User đăng nhập
const response = await login(email, password);

// 2. Server trả về JWT token
if (response.data.token) {
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("user", JSON.stringify(response.data.user));
}

// 3. Axios interceptor tự động gắn token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 6. API Usage Examples
```javascript
// Trong component React
import { login, askAIAboutProcedure, getAdminStats } from '../shared/api/api';

// Đăng nhập
const handleLogin = async () => {
  try {
    const response = await login(email, password);
    console.log('Login success:', response.data);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Hỏi AI
const handleAskAI = async (question) => {
  try {
    const response = await askAIAboutProcedure(question);
    console.log('AI response:', response.data);
  } catch (error) {
    console.error('AI request failed:', error);
  }
};
```

### 7. CORS Configuration
Backend đã được cấu hình CORS để cho phép frontend truy cập:
```go
// Backend Go - middleware/cors.go
func CORSMiddleware() gin.HandlerFunc {
    return gin.HandlerFunc(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "http://localhost:3000")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    })
}
```

### 8. Environment Variables
```bash
# Backend (.env file)
PORT=8080
MONGODB_URI=mongodb://localhost:27017/web_ai
JWT_SECRET=your_jwt_secret_key
MISTRAL_API_KEY=your_mistral_api_key

# Frontend (.env file) 
REACT_APP_API_URL=http://localhost:8080
```

### 9. Troubleshooting
**Lỗi CORS**: Đảm bảo backend đã bật CORS middleware
**Lỗi 404**: Kiểm tra proxy config và backend routes
**Token expired**: Implement refresh token logic
**Connection refused**: Đảm bảo backend đang chạy trên port 8080
