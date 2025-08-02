import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Đổi nếu BE port khác

// Tạo instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor để gắn token vào Header tự động
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API Authentication
export const register = (email, password) => api.post("/api/auth/register", { email, password });
export const login = (email, password) => api.post("/api/auth/login", { email, password });

// Conversations
export const createConversation = (title = "Cuộc trò chuyện mới") => api.post("/api/conversations", { title });
export const getConversations = () => api.get("/api/conversations");

// Chat
export const chatWithAI = (conversationId, question) =>
  api.post("/api/chat", { conversation_id: conversationId, question });

// Public Chat (không cần login)
export const publicChat = (question) => api.post("/api/chat/public", { question });

export default api;
