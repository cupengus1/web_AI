import axios from 'axios';

const API_BASE_URL = '/'; // Sử dụng proxy được cấu hình trong package.json

// Tạo instance Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Interceptor: tự động gắn token vào Header
api.interceptors.request.use((config) => {
  const url = config.url || "";
  const isAdminAPI = url.startsWith("/api/admin");

  // Ưu tiên: API admin dùng adminToken; API thường dùng user token
  const adminToken = localStorage.getItem("adminToken");
  const userToken = localStorage.getItem("token");

  if (isAdminAPI && adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  } else if (isAdminAPI && adminToken) {
    // fallback redundant (kept for clarity)
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// =============================================
// AUTHENTICATION APIs
// =============================================
export const register = (name, email, password) => api.post("/api/auth/register", { name, email, password });
export const login = (email, password) => api.post("/api/auth/login", { email, password });
export const logout = () => api.post("/api/auth/logout");
export const forgotPassword = (email) => {
    return axios.post('http://localhost:5000/api/auth/forgot-password', { email });
};

// =============================================
// PROCEDURES APIs (Quy trình nội bộ)
// =============================================
export const getProcedures = () => api.get("/api/procedures");
export const getProcedureById = (id) => api.get(`/api/procedures/${id}`);
export const searchProcedures = (query) => api.get(`/api/procedures/search?q=${query}`);
export const getProceduresByCategory = (category) => api.get(`/api/procedures/category/${category}`);

// =============================================
// AI CHAT APIs (Tích hợp AI để giải đáp với RAG)
// =============================================
export const askAIAboutProcedure = (question, procedureId = null) => 
  api.post("/api/chat/procedures", { question, procedure_id: procedureId });

export const askAI = (question) => api.post("/api/chat", { question });
export const askAIPublic = (question) => api.post("/api/chat/public", { question });

// Enhanced Chat APIs with Persistence
export const sendChatMessage = (message, conversationId = null) => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  
  if (token) {
    // Authenticated user - use persistent chat endpoint
    return api.post("/api/chat", { message, conversation_id: conversationId });
  } else {
    // Anonymous user - use public endpoint
    return api.post("/api/chat/public", { question: message });
  }
};

export const getChatHistory = () => {
  const userToken = localStorage.getItem("token");
  if (!userToken) {
    // Trả về rỗng để UI không cần gọi server khi ẩn danh
    return Promise.resolve({ data: { conversations: [], total: 0 } });
  }
  return api.get("/api/chat/history");
};
export const getChatConversation = (id) => api.get(`/api/chat/conversations/${id}`);
export const deleteChatConversation = (id) => api.delete(`/api/chat/conversations/${id}`);

// Function tương thích với DashboardPage (giao diện cũ)
export const chatWithAI = (message) => api.post("/api/chat/public", { question: message });

// =============================================
// CONVERSATIONS APIs
// =============================================
export const createConversation = (title = "Cuộc trò chuyện mới") => 
  api.post("/api/conversations", { title });
export const getConversations = () => api.get("/api/conversations");
export const getConversationById = (id) => api.get(`/api/conversations/${id}`);
export const deleteConversation = (id) => api.delete(`/api/conversations/${id}`);

// =============================================
// ADMIN APIs (Quản lý quy trình)
// =============================================
export const adminLogin = (email, password) => api.post("/api/admin/login", { email, password });

// Quản lý quy trình
export const createProcedure = (procedureData) => api.post("/api/admin/procedures", procedureData);
export const updateProcedure = (id, procedureData) => api.put(`/api/admin/procedures/${id}`, procedureData);
export const deleteProcedure = (id) => api.delete(`/api/admin/procedures/${id}`);

// Upload file (Word, PDF)
export const uploadProcedureFile = (file, title, category) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);
  formData.append('category', category);
  
  return api.post("/api/admin/procedures/upload", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// Quản lý danh mục
export const getCategories = () => api.get("/api/categories");
export const createCategory = (name, description) => 
  api.post("/api/admin/categories", { name, description });

// Thống kê
export const getAdminStats = () => api.get("/api/admin/stats");

export default api;
