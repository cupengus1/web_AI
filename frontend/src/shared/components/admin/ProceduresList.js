import React from 'react';

const ProceduresList = ({ 
  procedures, 
  categories, 
  onEdit, 
  onDelete, 
  isLoading 
}) => {
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Không xác định';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner">⏳</div>
        <p>Đang tải danh sách quy trình...</p>
      </div>
    );
  }

  if (procedures.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📋</div>
        <h3>Chưa có quy trình nào</h3>
        <p>Tạo quy trình đầu tiên để bắt đầu!</p>
      </div>
    );
  }

  return (
    <div className="procedures-list">
      <div className="procedures-header">
        <h3>📋 Danh sách quy trình ({procedures.length})</h3>
      </div>
      
      <div className="procedures-grid">
        {procedures.map(procedure => (
          <div key={procedure.id} className="procedure-card">
            <div className="procedure-header">
              <h4 className="procedure-title">{procedure.title}</h4>
              <span className="procedure-category">
                🏷️ {getCategoryName(procedure.category)}
              </span>
            </div>
            
            <div className="procedure-content">
              <p className="procedure-description">
                {procedure.description || 'Không có mô tả'}
              </p>
              
              <div className="procedure-preview">
                <strong>Nội dung:</strong>
                <p className="content-preview">
                  {procedure.content.length > 150 
                    ? `${procedure.content.substring(0, 150)}...` 
                    : procedure.content
                  }
                </p>
              </div>
            </div>
            
            <div className="procedure-meta">
              <small className="created-date">
                📅 Tạo: {formatDate(procedure.createdAt)}
              </small>
              {procedure.updatedAt && procedure.updatedAt !== procedure.createdAt && (
                <small className="updated-date">
                  ✏️ Cập nhật: {formatDate(procedure.updatedAt)}
                </small>
              )}
            </div>
            
            <div className="procedure-actions">
              <button 
                className="btn-edit"
                onClick={() => onEdit(procedure)}
                disabled={isLoading}
              >
                ✏️ Sửa
              </button>
              <button 
                className="btn-delete"
                onClick={() => {
                  if (window.confirm(`Bạn có chắc muốn xóa quy trình "${procedure.title}"?`)) {
                    onDelete(procedure.id);
                  }
                }}
                disabled={isLoading}
              >
                🗑️ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProceduresList;
