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
import AdminUserManagement from './AdminUserManagement';

// Trang quản trị gọn: điều hướng theo tab, CRUD quy trình, upload, danh mục, quản lý người dùng
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState('');

  // Logic quản trị (tải dữ liệu, hành động)
  const {
    isLoggedIn,
    categories,
    procedures,
    stats,
    isLoading,
    error,
    setError,
    logout,
    submitProcedure,
    removeProcedure,
    uploadFile,
    submitCategory
  } = useAdmin();

  // Quản lý form quy trình
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

  // Reset form và dọn dẹp file tạm/preview
  const resetForm = () => {
    resetFormData();
    setSelectedFile(null);
    setError('');
  };

  // Xử lý sự kiện
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

    // Xử lý preview nội dung file sau khi upload thành công
    try {
      if (selectedFile.type === 'application/pdf') {
        // Đọc PDF (chỉ text đơn giản, không hỗ trợ layout)
        const reader = new FileReader();
        reader.onload = async (ev) => {
          // Sử dụng PDF.js nếu muốn nâng cao, ở đây chỉ hiển thị base64
          setFilePreview('Đã upload file PDF. Không hỗ trợ xem trước nội dung trực tiếp.');
        };
        reader.readAsArrayBuffer(selectedFile);
      } else if (
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        selectedFile.name.endsWith('.docx')
      ) {
        setFilePreview('Đã upload file Word. Không hỗ trợ xem trước nội dung trực tiếp.');
      } else if (selectedFile.type.startsWith('text/')) {
        // Đọc file text/csv
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFilePreview(ev.target.result);
        };
        reader.readAsText(selectedFile);
      } else {
        setFilePreview('Đã upload file. Định dạng này không hỗ trợ xem trước.');
      }
    } catch (err) {
      setFilePreview('Không thể trích xuất nội dung file.');
    }
    // Không reset form để giữ preview
    setSelectedFile(null);
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

  // Xử lý cho quản lý quy trình (sửa/xoá)
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


  
  // Kiểm tra quyền truy cập admin
  if (!isLoggedIn) {
    return (
      <div className="admin-login">
        <div className="login-container">
          <h2>🔒 Cần quyền Admin</h2>
          <p>Bạn cần đăng nhập với tài khoản admin để truy cập trang này.</p>
          <button onClick={() => navigate('/signin')} className="login-redirect-btn">
            Đăng nhập
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Bảng điều khiển Admin kd.AI</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/dashboard')} className="logout-btn">Bảng điều khiển</button>
          <button onClick={handleLogout} className="logout-btn">Đăng xuất</button>
        </div>
      </header>

      <nav className="admin-nav">
        {[
          { key: 'dashboard', label: '📊 Bảng điều khiển' },
          { key: 'procedures', label: '📄 Quy trình' },
          { key: 'upload', label: '⬆️ Tải lên' },
          { key: 'categories', label: '🏷️ Danh mục' },
          { key: 'users', label: '👤 Người dùng' }
        ].map(tab => (
          <button 
            key={tab.key}
            className={activeTab === tab.key ? 'active' : ''} 
            onClick={() => setActiveTab(tab.key)}
            aria-selected={activeTab === tab.key}
          >
            {tab.label}
          </button>
        ))}
      </nav>
        {/* Users */}
        {activeTab === 'users' && (
          <AdminUserManagement />
        )}

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
            <h2>Thống kê hệ thống</h2>
            <div className="stats-grid">
              <StatsCard 
                title="Quy trình" 
                value={stats.totalProcedures} 
                isLoading={isLoading} 
              />
              <StatsCard 
                title="Danh mục" 
                value={stats.totalCategories} 
                isLoading={isLoading} 
              />
              <StatsCard 
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
            <h2>Quản lý quy trình</h2>
            
            {/* Procedure Form */}
            <div className="procedures-form-section">
              <h3>{isEditing ? ' Sửa quy trình' : ' Tạo quy trình mới'}</h3>
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
            <h2>Upload file quy trình</h2>
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
                accept=".doc,.docx,.pdf,.txt,.csv"
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
            {filePreview && (
              <div className="file-preview" style={{marginTop:20}}>
                <strong>Xem trước/trích xuất nội dung file:</strong>
                <div className="content-preview" style={{whiteSpace:'pre-wrap',maxHeight:300,overflow:'auto',marginTop:8}}>
                  {filePreview}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Categories */}
        {activeTab === 'categories' && (
          <div className="categories-management">
            <h2>Quản lý danh mục</h2>
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
              <h3>Danh mục hiện có</h3>
              {categories.length > 0 ? (
                <ul className="category-list" role="list">
                  {categories.map(cat => (
                    <li key={cat.id} className="category-list-item">
                      <div className="category-info">
                        <div className="category-line">
                          <strong className="category-name">{cat.name}</strong>
                          <span className="category-id">#{cat.id}</span>
                        </div>
                        {cat.description && (
                          <p className="category-desc">{cat.description}</p>
                        )}
                      </div>
                      <div className="category-meta">
                        <small>
                          Tạo: {new Date(cat.createdAt || cat.created_at).toLocaleDateString('vi-VN')}
                        </small>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="empty-state">
                  <p>Chưa có danh mục nào</p>
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
