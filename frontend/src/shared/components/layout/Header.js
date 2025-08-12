import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

// Thanh Header trên cùng của ứng dụng: logo, điều hướng, đăng nhập/đăng xuất, và link quản trị (nếu là admin)
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Kiểm tra trạng thái đăng nhập từ localStorage
  const userToken = localStorage.getItem('token');
  const isLoggedIn = !!userToken;
  // Lấy thông tin user đã lưu sau khi đăng nhập để chào theo tên
  let userName = '';
  try {
    const userRaw = localStorage.getItem('user');
    if (userRaw) {
      const u = JSON.parse(userRaw);
      userName = u?.name || u?.email || '';
    }
  } catch {}
  
  // Giải mã JWT để lấy vai trò người dùng
  let userRole = 'user';
  let isAdmin = false;
  
  if (userToken) {
    try {
      const payload = JSON.parse(atob(userToken.split('.')[1]));
      userRole = payload.role || 'user';
      isAdmin = userRole === 'admin';
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  const handleLogout = () => {
    // Đăng xuất và quay về trang chủ
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  // Ẩn Header trên các trang dành riêng cho admin
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <div to="/" className="logo">
          <span className="logo-text">kd.AI</span>
        </div>

        {/* Điều hướng chính */}
        <nav className="nav-menu">
          <Link 
            to="/procedures" 
            className={location.pathname === '/procedures' ? 'nav-link active' : 'nav-link'}
          >
            Quy trình
          </Link>
          <Link 
            to="/chat" 
            className={location.pathname === '/chat' ? 'nav-link active' : 'nav-link'}
          >
            Chat AI
          </Link>
        </nav>

        {/* Khu vực xác thực: hiển thị tuỳ theo trạng thái đăng nhập */}
        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="welcome-text">
                {userName ? `Xin chào, ${userName}!` : 'Xin chào!'}
              </span>
              <button onClick={handleLogout} className="logout-btn">
                Đăng xuất
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/signin" 
                className="auth-link signin"
              >
                Đăng nhập
              </Link>
              <Link 
                to="/signup" 
                className="auth-link signup"
              >
                Đăng ký
              </Link>
            </div>
          )}
          
          {/* Link vào khu vực quản trị - chỉ hiển thị khi là admin */}
          {isAdmin && (
            <Link to="/admin" className="admin-link">
              Quản trị
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
