import React, { useState, useEffect } from 'react';
import './AdminDashboard.css';
import { 
  adminLogin, 
  createProcedure, 
  updateProcedure, 
  deleteProcedure, 
  uploadProcedureFile,
  getCategories,
  createCategory,
  getAdminStats
} from '../../../shared/api/api';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminToken, setAdminToken] = useState('');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [procedures, setProcedures] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [procedureForm, setProcedureForm] = useState({
    title: '',
    content: '',
    category: '',
    description: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if admin is already logged in
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      setAdminToken(token);
      setIsLoggedIn(true);
      loadData();
    }
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [categoriesRes, statsRes] = await Promise.all([
        getCategories(),
        getAdminStats()
      ]);
      setCategories(categoriesRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await adminLogin(loginForm.email, loginForm.password);
      const token = response.data.token;
      localStorage.setItem('adminToken', token);
      setAdminToken(token);
      setIsLoggedIn(true);
      loadData();
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Đăng nhập thất bại: ' + (error.response?.data?.error || 'Email hoặc mật khẩu không đúng'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setAdminToken('');
    setProcedures([]);
    setCategories([]);
    setStats({});
    setError('');
    navigate('/');
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !procedureForm.title || !procedureForm.category) {
      setError('Vui lòng điền đầy đủ thông tin và chọn file');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await uploadProcedureFile(selectedFile, procedureForm.title, procedureForm.category);
      alert('Upload thành công!');
      setSelectedFile(null);
      setProcedureForm({ title: '', content: '', category: '', description: '' });
    } catch (error) {
      console.error('Upload error:', error);
      setError('Upload thất bại: ' + (error.response?.data?.error || 'Lỗi không xác định'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProcedure = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isEditing) {
        await updateProcedure(editingId, procedureForm);
        alert('Cập nhật thành công!');
        setIsEditing(false);
        setEditingId(null);
      } else {
        await createProcedure(procedureForm);
        alert('Tạo quy trình thành công!');
      }
      setProcedureForm({ title: '', content: '', category: '', description: '' });
    } catch (error) {
      console.error('Procedure operation error:', error);
      setError('Thao tác thất bại: ' + (error.response?.data?.error || 'Lỗi không xác định'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProcedure = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa quy trình này?')) {
      setIsLoading(true);
      setError('');

      try {
        await deleteProcedure(id);
        alert('Xóa thành công!');
        // Reload procedures list
      } catch (error) {
        console.error('Delete error:', error);
        setError('Xóa thất bại: ' + (error.response?.data?.error || 'Lỗi không xác định'));
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleEditProcedure = (procedure) => {
    setProcedureForm({
      title: procedure.title,
      content: procedure.content,
      category: procedure.category,
      description: procedure.description
    });
    setIsEditing(true);
    setEditingId(procedure.id);
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    const { title: name, description } = procedureForm;
    if (!name || !description) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await createCategory(name, description);
      alert('Tạo danh mục thành công!');
      setProcedureForm({ title: '', content: '', category: '', description: '' });
      loadData();
    } catch (error) {
      console.error('Category creation error:', error);
      setError('Tạo danh mục thất bại: ' + (error.response?.data?.error || 'Lỗi không xác định'));
    } finally {
      setIsLoading(false);
    }
  };

  // if (!isLoggedIn) {
  //   return (
  //     <div className="admin-login">
  //       <div className="login-card">
  //         <h2>Admin Login</h2>
          
  //         {error && (
  //           <div className="error-message">
  //             {error}
  //           </div>
  //         )}

  //         <form onSubmit={handleLogin}>
  //           <div className="form-group">
  //             <label>Email:</label>
  //             <input
  //               type="email"
  //               value={loginForm.email}
  //               onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
  //               required
  //               disabled={isLoading}
  //             />
  //           </div>
  //           <div className="form-group">
  //             <label>Password:</label>
  //             <input
  //               type="password"
  //               value={loginForm.password}
  //               onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
  //               required
  //               disabled={isLoading}
  //             />
  //           </div>
  //           <button type="submit" disabled={isLoading}>
  //             {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
  //           </button>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
      </header>

      <nav className="admin-nav">
        <button 
          className={activeTab === 'dashboard' ? 'active' : ''} 
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={activeTab === 'procedures' ? 'active' : ''} 
          onClick={() => setActiveTab('procedures')}
        >
          Quản lý quy trình
        </button>
        <button 
          className={activeTab === 'upload' ? 'active' : ''} 
          onClick={() => setActiveTab('upload')}
        >
          Upload file
        </button>
        <button 
          className={activeTab === 'categories' ? 'active' : ''} 
          onClick={() => setActiveTab('categories')}
        >
          Quản lý danh mục
        </button>
      </nav>

      <main className="admin-content">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <h2>Thống kê</h2>
            {isLoading ? (
              <div className="loading">Đang tải dữ liệu...</div>
            ) : (
              <div className="stats-grid">
                <div className="stat-card">
                  <h3>Tổng quy trình</h3>
                  <p>{stats.totalProcedures || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Danh mục</h3>
                  <p>{stats.totalCategories || 0}</p>
                </div>
                <div className="stat-card">
                  <h3>Lượt truy cập</h3>
                  <p>{stats.totalVisits || 0}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'procedures' && (
          <div className="procedures-management">
            <h2>Quản lý quy trình</h2>
            <form onSubmit={handleCreateProcedure} className="procedure-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tiêu đề:</label>
                  <input
                    type="text"
                    value={procedureForm.title}
                    onChange={(e) => setProcedureForm({...procedureForm, title: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Danh mục:</label>
                  <select
                    value={procedureForm.category}
                    onChange={(e) => setProcedureForm({...procedureForm, category: e.target.value})}
                    required
                    disabled={isLoading}
                  >
                    <option value="">Chọn danh mục</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Mô tả:</label>
                <textarea
                  value={procedureForm.description}
                  onChange={(e) => setProcedureForm({...procedureForm, description: e.target.value})}
                  rows="3"
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Nội dung:</label>
                <textarea
                  value={procedureForm.content}
                  onChange={(e) => setProcedureForm({...procedureForm, content: e.target.value})}
                  rows="10"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-actions">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo quy trình')}
                </button>
                {isEditing && (
                  <button type="button" onClick={() => {
                    setIsEditing(false);
                    setEditingId(null);
                    setProcedureForm({ title: '', content: '', category: '', description: '' });
                  }} disabled={isLoading}>
                    Hủy
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {activeTab === 'upload' && (
          <div className="file-upload">
            <h2>Upload file quy trình</h2>
            <form onSubmit={handleFileUpload} className="upload-form">
              <div className="form-group">
                <label>Tiêu đề:</label>
                <input
                  type="text"
                  value={procedureForm.title}
                  onChange={(e) => setProcedureForm({...procedureForm, title: e.target.value})}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Danh mục:</label>
                <select
                  value={procedureForm.category}
                  onChange={(e) => setProcedureForm({...procedureForm, category: e.target.value})}
                  required
                  disabled={isLoading}
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>File (Word/PDF):</label>
                <input
                  type="file"
                  accept=".doc,.docx,.pdf"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  disabled={isLoading}
                />
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang upload...' : 'Upload'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-management">
            <h2>Quản lý danh mục</h2>
            <form onSubmit={handleCreateCategory} className="category-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Tên danh mục:</label>
                  <input
                    type="text"
                    value={procedureForm.title}
                    onChange={(e) => setProcedureForm({...procedureForm, title: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="form-group">
                  <label>Mô tả:</label>
                  <input
                    type="text"
                    value={procedureForm.description}
                    onChange={(e) => setProcedureForm({...procedureForm, description: e.target.value})}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <button type="submit" disabled={isLoading}>
                {isLoading ? 'Đang tạo...' : 'Tạo danh mục'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
