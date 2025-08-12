import { useState, useEffect, useCallback } from 'react';
import { 
  getCategories,
  getAdminStats,
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  uploadProcedureFile,
  createCategory
} from '../api/api';

// Hook quản trị: quản lý trạng thái admin, tải danh mục/quy trình/thống kê và xử lý CRUD
export const useAdmin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Kiểm tra quyền admin dựa trên JWT
  const checkAdminStatus = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoggedIn(false);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const isAdmin = payload.role === 'admin';
      setIsLoggedIn(isAdmin);
      return isAdmin;
    } catch (error) {
      console.error('Error decoding token:', error);
      setIsLoggedIn(false);
      return false;
    }
  }, []);

  // Hàm hỗ trợ debug trong môi trường phát triển
  const debug = (action, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 Admin Debug [${action}]:`, data);
    }
  };

  const showSuccess = (msg) => {
    debug('SUCCESS', msg);
    alert(msg);
  };

  const showError = (err) => {
    const errorMsg = err.response?.data?.error || err.message || 'Có lỗi xảy ra';
    debug('ERROR', errorMsg);
    setError(errorMsg);
  };

  const loadData = useCallback(async () => {
    try {
      debug('LOAD_DATA', 'Starting...');
      setIsLoading(true);
      
      console.log('🔍 CALLING APIs...');
      const [categoriesRes, statsRes, proceduresRes] = await Promise.all([
        getCategories(), 
        getAdminStats(),
        getProcedures()
      ]);
      
      console.log('🔍 CATEGORIES RESPONSE:', categoriesRes);
      console.log('🔍 STATS RESPONSE:', statsRes);
      console.log('🔍 PROCEDURES RESPONSE:', proceduresRes);
      
      // Trích xuất dữ liệu từ phản hồi API
      const categoriesData = categoriesRes.data?.categories || categoriesRes.data || [];
      const statsData = statsRes.data || statsRes;
      const proceduresData = proceduresRes.data?.procedures || proceduresRes.data || [];
      
      console.log('🔍 SETTING CATEGORIES:', categoriesData);
      console.log('🔍 SETTING STATS:', statsData);
      console.log('🔍 SETTING PROCEDURES:', proceduresData);
      
      setCategories(categoriesData);
      setStats(statsData);
      setProcedures(proceduresData);
      debug('LOAD_DATA', { categories: categoriesData, stats: statsData, procedures: proceduresData });
    } catch (error) {
      console.error('🔍 LOAD_DATA_ERROR:', error);
      debug('LOAD_DATA_ERROR', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = () => {
    debug('LOGOUT', 'Logging out...');
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setCategories([]);
    setProcedures([]);
    setStats({});
    setError('');
  };

  // Tự động kiểm tra quyền admin và tải dữ liệu khi mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAdmin = checkAdminStatus();
      console.log('🔍 CHECK AUTH - Is Admin:', isAdmin);
      if (isAdmin) {
        debug('AUTH_CHECK', 'User has admin role, loading data...');
        try {
          await loadData();
        } catch (error) {
          console.error('🔍 LOAD DATA ERROR:', error);
          // Nếu tải dữ liệu thất bại, có thể người dùng không còn quyền admin
          logout();
        }
      }
    };
    checkAuth();
  }, [checkAdminStatus, loadData]);

  const submitProcedure = async (procedureData, isEditing, editingId) => {
    try {
      debug('SUBMIT_PROCEDURE', { procedureData, isEditing, editingId });
      setIsLoading(true);
      
      if (isEditing) {
        await updateProcedure(editingId, procedureData);
        showSuccess('Cập nhật thành công!');
      } else {
        await createProcedure(procedureData);
        showSuccess('Tạo quy trình thành công!');
      }
      
  // Làm mới danh sách quy trình
      loadData();
    } catch (error) {
      debug('SUBMIT_PROCEDURE_ERROR', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeProcedure = async (procedureId) => {
    try {
      debug('DELETE_PROCEDURE', { procedureId });
      setIsLoading(true);
      await deleteProcedure(procedureId);
      showSuccess('Xóa quy trình thành công!');
      
  // Làm mới danh sách quy trình
      loadData();
    } catch (error) {
      debug('DELETE_PROCEDURE_ERROR', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const uploadFile = async (file, title, category) => {
    try {
      debug('UPLOAD_FILE', { fileName: file.name, title, category });
      setIsLoading(true);
      await uploadProcedureFile(file, title, category);
      showSuccess('Upload thành công!');
    } catch (error) {
      debug('UPLOAD_FILE_ERROR', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitCategory = async (name, description) => {
    try {
      debug('SUBMIT_CATEGORY', { name, description });
      setIsLoading(true);
      await createCategory(name, description);
      showSuccess('Tạo danh mục thành công!');
      loadData();
    } catch (error) {
      debug('SUBMIT_CATEGORY_ERROR', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoggedIn,
    categories,
    procedures,
    stats,
    isLoading,
    error,
    setError,
    
    // Actions
    logout,
    loadData,
    submitProcedure,
    removeProcedure,
    uploadFile,
    submitCategory,
    showSuccess,
    showError
  };
};
