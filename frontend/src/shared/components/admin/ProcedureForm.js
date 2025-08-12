import React from 'react';
import FormField from './FormField';

// Form tạo/sửa một Quy trình (Procedure)
const ProcedureForm = ({ 
  formData, 
  onFieldChange, 
  onSubmit, 
  onCancel,
  categories, 
  isLoading, 
  isEditing 
}) => {
  return (
    <form onSubmit={onSubmit} className="procedure-form">
      <div className="form-row">
        <FormField
          label="Tiêu đề"
          field="title"
          value={formData.title}
          onChange={onFieldChange}
          required
          disabled={isLoading}
          placeholder="Nhập tiêu đề quy trình..."
        />
        <FormField
          label="Danh mục"
          type="select"
          field="category"
          value={formData.category}
          onChange={onFieldChange}
          options={categories}
          required
          disabled={isLoading}
        />
      </div>
      
      <FormField
        label="Mô tả"
        type="textarea"
        field="description"
        value={formData.description}
        onChange={onFieldChange}
        rows={3}
        disabled={isLoading}
        placeholder="Mô tả ngắn về quy trình..."
      />
      
      <FormField
        label="Nội dung"
        type="textarea"
        field="content"
        value={formData.content}
        onChange={onFieldChange}
        rows={10}
        required
        disabled={isLoading}
        placeholder="Nội dung chi tiết của quy trình..."
      />
      
      <div className="form-actions">
        <button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? 'Đang xử lý...' : (isEditing ? 'Cập nhật' : 'Tạo quy trình')}
        </button>
        {isEditing && (
          <button type="button" onClick={onCancel} disabled={isLoading} className="btn-secondary">
            Hủy
          </button>
        )}
      </div>
    </form>
  );
};

export default ProcedureForm;
