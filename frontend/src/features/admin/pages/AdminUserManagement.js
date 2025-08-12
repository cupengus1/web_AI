import React, { useEffect, useState } from 'react';
import api from '../../../shared/api/api';
import './AdminUserManagement.css';

// Form tạo/sửa người dùng
const UserForm = ({ user, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
    password: '' // Chỉ dùng khi tạo mới
  });

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="user-form">
      <div className="form-group">
        <label>Họ tên:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      {!user && (
        <div className="form-group">
          <label>Mật khẩu:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required={!user}
          />
        </div>
      )}
      <div className="form-group">
        <label>Vai trò:</label>
        <select name="role" value={formData.role} onChange={handleChange}>
          {/* Giữ nguyên value để backend hiểu, chỉ đổi nhãn hiển thị */}
          <option value="user">Người dùng</option>
          <option value="admin">Quản trị</option>
        </select>
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-submit">
          {user ? 'Cập nhật' : 'Thêm mới'}
        </button>
        <button type="button" className="btn-cancel" onClick={onCancel}>
          Hủy
        </button>
      </div>
    </form>
  );
};

// Trang quản lý người dùng: danh sách, thêm, sửa, xoá
const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      setError('Không thể tải danh sách user');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (userData) => {
    try {
      const res = await api.post('/api/admin/users', userData);
      setUsers(prev => [...prev, res.data.user]);
      setIsAddingUser(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể thêm user');
    }
  };

  const handleUpdateUser = async (userData) => {
    try {
      await api.put(`/api/admin/users/${editingUser.id}`, userData);
      setUsers(prev => prev.map(u => 
        u.id === editingUser.id ? { ...u, ...userData } : u
      ));
      setEditingUser(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể cập nhật user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa user này?')) return;
    
    try {
      await api.delete(`/api/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      setError(err.response?.data?.error || 'Không thể xóa user');
    }
  };

  // Lọc theo từ khóa và vai trò
  const filtered = users.filter(u => {
    const text = `${u.name} ${u.email}`.toLowerCase();
    const okText = text.includes(query.toLowerCase());
    const okRole = roleFilter === 'all' ? true : u.role === roleFilter;
    return okText && okRole;
  });

  return (
    <div className="admin-user-management">
      <h2>Quản lý người dùng</h2>
      {error && <div className="error-message">{error}</div>}

      <div className="toolbar">
        <div className="search">
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="filters">
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="all">Tất cả vai trò</option>
            <option value="admin">Quản trị</option>
            <option value="user">Người dùng</option>
          </select>
        </div>
        <div className="actions">
          <button 
            className="btn-add" 
            onClick={() => setIsAddingUser(true)}
            disabled={loading || isAddingUser || editingUser}
          >
            ➕ Thêm User
          </button>
        </div>
      </div>

      {(isAddingUser || editingUser) && (
        <div className="form-overlay">
          <UserForm 
            user={editingUser}
            onSubmit={editingUser ? handleUpdateUser : handleAddUser}
            onCancel={() => {
              setEditingUser(null);
              setIsAddingUser(false);
            }}
          />
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => (
              <tr key={user.id}>
                <td>{idx + 1}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role === 'admin' ? 'Quản trị' : 'Người dùng'}
                  </span>
                </td>
                <td className="actions">
                  <button
                    className="btn-edit"
                    onClick={() => setEditingUser(user)}
                    disabled={isAddingUser || editingUser}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={isAddingUser || editingUser}
                  >
                    🗑️ Xóa
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminUserManagement;
