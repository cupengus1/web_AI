import { useState, useEffect, useCallback } from 'react';
import { 
  adminLogin, 
  getCategories,
  getAdminStats,
  getProcedures,
  createProcedure,
  updateProcedure,
  deleteProcedure,
  uploadProcedureFile,
  createCategory
} from '../api/api';

export const useAdmin = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [categories, setCategories] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug helpers
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
      
      // Extract data from responses
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

  const login = async (email, password) => {
    try {
      debug('LOGIN', { email });
      setIsLoading(true);
      const response = await adminLogin(email, password);
      localStorage.setItem('adminToken', response.data.token);
      setIsLoggedIn(true);
      loadData();
      debug('LOGIN_SUCCESS', 'Logged in successfully');
    } catch (error) {
      debug('LOGIN_ERROR', error);
      showError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    debug('LOGOUT', 'Logging out...');
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setCategories([]);
    setProcedures([]);
    setStats({});
    setError('');
  };

  // Auto-check token and load data on mount
  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('adminToken');
      console.log('🔍 CHECK AUTH - Token exists:', !!adminToken);
      if (adminToken) {
        debug('AUTH_CHECK', 'Found admin token, loading data...');
        setIsLoggedIn(true);
        try {
          await loadData();
        } catch (error) {
          console.error('🔍 LOAD DATA ERROR:', error);
        }
      }
    };
    checkAuth();
  }, [loadData]);

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
      
      // Refresh procedures list
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
      
      // Refresh procedures list
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
    login,
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
