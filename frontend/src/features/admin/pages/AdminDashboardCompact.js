import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

// Hooks
import { useForm } from '../../../shared/hooks/useForm';
import { useAdmin } from '../../../shared/hooks/useAdmin';

// Components
import StatsCard from '../../../shared/components/admin/StatsCard';
import FormField from '../../../shared/components/admin/FormField';
import ProcedureForm from '../../../shared/components/admin/ProcedureForm';
import ProceduresList from '../../../shared/components/admin/ProceduresList';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Admin logic
  const {
    isLoggedIn,
    categories,
    procedures,
    stats,
    isLoading,
    error,
    setError,
    login,
    logout,
    submitProcedure,
    removeProcedure,
    uploadFile,
    submitCategory
  } = useAdmin();

  // Form management
  const INITIAL_FORM_STATE = {
    title: '',
    content: '',
    category: '',
    description: ''
  };

  const {
    formData: procedureForm,
    updateField,
    resetForm: resetFormData,
    isEditing,
    editingId,
    setEditMode
  } = useForm(INITIAL_FORM_STATE);

  // Enhanced reset with file cleanup
  const resetForm = () => {
    resetFormData();
    setSelectedFile(null);
    setError('');
  };

  // Handlers
  const handleLogin = async (e) => {
    e.preventDefault();
    await login(loginForm.email, loginForm.password);
  };

  const handleLogout = () => {
    logout();
    resetForm();
    navigate('/');
  };

  const handleProcedureSubmit = async (e) => {
    e.preventDefault();
    await submitProcedure(procedureForm, isEditing, editingId);
    resetForm();
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile || !procedureForm.title || !procedureForm.category) {
      setError('Vui lòng điền đầy đủ thông tin và chọn file');
      return;
    }
    await uploadFile(selectedFile, procedureForm.title, procedureForm.category);
    resetForm();
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!procedureForm.title || !procedureForm.description) {
      setError('Vui lòng điền đầy đủ thông tin');
      return;
    }
    await submitCategory(procedureForm.title, procedureForm.description);
    resetForm();
  };

  // Procedure management handlers
  const handleEditProcedure = (procedure) => {
    console.log('🔧 EDIT PROCEDURE:', procedure);
    const procedureData = {
      title: procedure.title,
      content: procedure.content,
      category: procedure.category,
      description: procedure.description
    };
    console.log('🔧 SETTING EDIT MODE:', procedureData, procedure.id);
    setEditMode(procedureData, procedure.id);
    setActiveTab('procedures'); // Switch to procedures tab
  };

  const handleDeleteProcedure = async (procedureId) => {
    await removeProcedure(procedureId);
  };

  const handleFormFieldChange = (field, value) => {
    updateField(field, value);
    if (error) setError(''); // Clear error when typing
  };

  // Login Form Component
  const LoginForm = () => (
    <div className="admin-login">
      <div className="login-card">
        <h2>🔐 Admin Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleLogin}>
          <FormField
            label="Email"
            type="email"
            field="email"
            value={loginForm.email}
            onChange={(field, value) => setLoginForm({...loginForm, [field]: value})}
            required
            disabled={isLoading}
            placeholder="admin@example.com"
          />
          <FormField
            label="Password"
            type="password"
            field="password"
            value={loginForm.password}
            onChange={(field, value) => setLoginForm({...loginForm, [field]: value})}
            required
            disabled={isLoading}
            placeholder="••••••••"
          />
          <button type="submit" disabled={isLoading} className="btn-primary full-width">
            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );

  // Input Field Component - Remove this old inline component
  
  if (!isLoggedIn) return <LoginForm />;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>⚙️ Admin Panel</h1>
        <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
      </header>

      <nav className="admin-nav">
        {[
          { key: 'dashboard', label: '📊 Dashboard' },
          { key: 'procedures', label: '📝 Quy trình' },
          { key: 'upload', label: '📁 Upload' },
          { key: 'categories', label: '🏷️ Danh mục' }
        ].map(tab => (
          <button 
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''} 
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="admin-content">
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')}>×</button>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="dashboard-stats">
            <h2>📊 Thống kê hệ thống</h2>
            <div className="stats-grid">
              <StatsCard 
                icon="📄" 
                title="Quy trình" 
                value={stats.totalProcedures} 
                isLoading={isLoading} 
              />
              <StatsCard 
                icon="🏷️" 
                title="Danh mục" 
                value={stats.totalCategories} 
                isLoading={isLoading} 
              />
              <StatsCard 
                icon="👥" 
                title="Truy cập" 
                value={stats.totalVisits} 
                isLoading={isLoading} 
              />
            </div>
          </div>
        )}

        {/* Procedures */}
        {activeTab === 'procedures' && (
          <div className="procedures-management">
            <h2>📝 Quản lý quy trình</h2>
            
            {/* Procedure Form */}
            <div className="procedures-form-section">
              <h3>{isEditing ? '✏️ Sửa quy trình' : '➕ Tạo quy trình mới'}</h3>
              <ProcedureForm
                formData={procedureForm}
                onFieldChange={handleFormFieldChange}
                onSubmit={handleProcedureSubmit}
                onCancel={resetForm}
                categories={categories}
                isLoading={isLoading}
                isEditing={isEditing}
              />
            </div>

            {/* Procedures List */}
            <div className="procedures-list-section">
              <ProceduresList
                procedures={procedures}
                categories={categories}
                onEdit={handleEditProcedure}
                onDelete={handleDeleteProcedure}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}

        {/* Upload */}
        {activeTab === 'upload' && (
          <div className="file-upload">
            <h2>📁 Upload file quy trình</h2>
            <form onSubmit={handleFileUpload} className="upload-form">
              <FormField
                label="Tiêu đề"
                field="title"
                value={procedureForm.title}
                onChange={handleFormFieldChange}
                required
                disabled={isLoading}
                placeholder="Tiêu đề cho file upload..."
              />
              <FormField
                label="Danh mục"
                type="select"
                field="category"
                value={procedureForm.category}
                onChange={handleFormFieldChange}
                options={categories}
                required
                disabled={isLoading}
              />
              <FormField
                label="File (Word/PDF)"
                type="file"
                field="file"
                value=""
                onChange={(field, file) => setSelectedFile(file)}
                accept=".doc,.docx,.pdf"
                required
                disabled={isLoading}
              />
              {selectedFile && (
                <div className="file-info">
                  📎 <strong>{selectedFile.name}</strong> 
                  <span className="file-size">
                    ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Đang upload...' : 'Upload File'}
              </button>
            </form>
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div className="categories-management">
            <h2>🏷️ Quản lý danh mục</h2>
            <form onSubmit={handleCategorySubmit} className="category-form">
              <div className="form-row">
                <FormField
                  label="Tên danh mục"
                  field="title"
                  value={procedureForm.title}
                  onChange={handleFormFieldChange}
                  required
                  disabled={isLoading}
                  placeholder="Ví dụ: Nhân sự, Kế toán..."
                />
                <FormField
                  label="Mô tả"
                  field="description"
                  value={procedureForm.description}
                  onChange={handleFormFieldChange}
                  required
                  disabled={isLoading}
                  placeholder="Mô tả ngắn về danh mục..."
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-primary">
                {isLoading ? 'Đang tạo...' : 'Tạo danh mục'}
              </button>
            </form>
            
            <div className="categories-list">
              <h3>Danh mục hiện có:</h3>
              {categories.length > 0 ? (
                <div className="categories-grid">
                  {categories.map(cat => (
                    <div key={cat.id} className="category-card">
                      <div className="category-header">
                        <h4>{cat.name}</h4>
                        <span className="category-id">#{cat.id}</span>
                      </div>
                      <p>{cat.description}</p>
                      <div className="category-footer">
                        <small>Tạo: {new Date(cat.createdAt).toLocaleDateString()}</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>📂 Chưa có danh mục nào</p>
                  <small>Tạo danh mục đầu tiên để bắt đầu!</small>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
