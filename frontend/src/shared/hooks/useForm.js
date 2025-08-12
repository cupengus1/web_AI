import { useState } from 'react';

// Hook tiện ích quản lý form: dữ liệu, chế độ chỉnh sửa và reset
export const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Cập nhật một trường trong form theo tên
  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Đặt lại form về trạng thái ban đầu
  const resetForm = () => {
    setFormData(initialState);
    setIsEditing(false);
    setEditingId(null);
  };

  // Bật chế độ chỉnh sửa với dữ liệu và id tương ứng
  const setEditMode = (data, id) => {
    setFormData(data);
    setIsEditing(true);
    setEditingId(id);
  };

  return {
    formData,
    setFormData,
    updateField,
    resetForm,
    isEditing,
    editingId,
    setEditMode,
    setIsEditing,
    setEditingId
  };
};
