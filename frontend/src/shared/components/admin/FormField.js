import React from 'react';

const FormField = ({ 
  label, 
  type = 'text', 
  field, 
  value,
  onChange,
  rows, 
  required = false, 
  disabled = false,
  options = null,
  placeholder = '',
  accept = ''
}) => {
  const handleChange = (e) => {
    if (type === 'file') {
      onChange(field, e.target.files[0]);
    } else {
      onChange(field, e.target.value);
    }
  };

  return (
    <div className="form-group">
      <label>{label}:{required && <span className="required"> *</span>}</label>
      
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={handleChange}
          rows={rows}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
        />
      ) : type === 'select' ? (
        <select
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
        >
          <option value="">-- Chọn {label.toLowerCase()} --</option>
          {Array.isArray(options) ? options.map(option => (
            <option key={option.id || option._id} value={option.id || option._id}>
              {option.name}
            </option>
          )) : (
            <option disabled>Đang tải danh mục...</option>
          )}
        </select>
      ) : type === 'file' ? (
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={handleChange}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
    </div>
  );
};

export default FormField;
