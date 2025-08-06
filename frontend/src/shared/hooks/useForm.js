import { useState } from 'react';

export const useForm = (initialState) => {
  const [formData, setFormData] = useState(initialState);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialState);
    setIsEditing(false);
    setEditingId(null);
  };

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
