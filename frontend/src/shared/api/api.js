import axios from 'axios';

const API_BASE_URL = '/'; // Sử dụng proxy được cấu hình trong package.json

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

// =============================================
// AUTHENTICATION APIs
// =============================================
export const register = (email, password) => api.post("/api/auth/register", { email, password });
export const login = (email, password) => api.post("/api/auth/login", { email, password });
export const logout = () => api.post("/api/auth/logout");

// =============================================
// PROCEDURES APIs (Quy trình nội bộ)
// =============================================
export const getProcedures = () => api.get("/api/procedures");
export const getProcedureById = (id) => api.get(`/api/procedures/${id}`);
export const searchProcedures = (query) => api.get(`/api/procedures/search?q=${query}`);
export const getProceduresByCategory = (category) => api.get(`/api/procedures/category/${category}`);

// =============================================
// AI CHAT APIs (Tích hợp AI để giải đáp)
// =============================================
export const askAIAboutProcedure = (question, procedureId = null) => 
  api.post("/api/ai/ask", { question, procedure_id: procedureId });

export const publicChat = (question) => api.post("/api/chat/public", { question });

// Chat với context về quy trình
export const chatWithProcedureContext = (question, procedureIds) =>
  api.post("/api/ai/chat-with-context", { question, procedure_ids: procedureIds });

// Function tương thích với DashboardPage (giao diện cũ)
export const chatWithAI = (message) => api.post("/api/ai/ask", { question: message });

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
