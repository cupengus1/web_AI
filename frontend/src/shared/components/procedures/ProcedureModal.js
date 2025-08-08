import React from 'react';
import './ProcedureModal.css';

const ProcedureModal = ({ procedure, onClose }) => {
  if (!procedure) return null;

  return (
    <div className="procedure-modal-overlay" onClick={onClose}>
      <div className="procedure-modal-content" onClick={e => e.stopPropagation()}>
        <div className="procedure-modal-header">
          <h2>{procedure.title}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="procedure-modal-body">
          <div className="procedure-info">
            <span className="procedure-category">📂 {procedure.category}</span>
            <span className="procedure-date">
              📅 {new Date(procedure.created_at).toLocaleDateString('vi-VN')}
            </span>
            <span className="procedure-views">👁️ {procedure.views || 0} lượt xem</span>
          </div>

          <div className="procedure-description">
            <h3>Mô tả</h3>
            <p>{procedure.description || 'Không có mô tả'}</p>
          </div>

          <div className="procedure-content">
            <h3>Nội dung quy trình</h3>
            <div className="content-text">
              {procedure.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcedureModal;
