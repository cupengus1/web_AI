import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in
  const userToken = localStorage.getItem('token');
  const adminToken = localStorage.getItem('adminToken');
  const isLoggedIn = !!userToken;
  const isAdmin = !!adminToken;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  // Don't show header on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="app-header">
      <div className="header-container">
        {/* Logo */}
        <Link to="/" className="logo">
          <span className="logo-icon">🤖</span>
          <span className="logo-text">Web AI Assistant</span>
        </Link>

        {/* Navigation */}
        <nav className="nav-menu">
          <Link 
            to="/" 
            className={location.pathname === '/' ? 'nav-link active' : 'nav-link'}
          >
            🏠 Trang chủ
          </Link>
          
          <Link 
            to="/procedures" 
            className={location.pathname === '/procedures' ? 'nav-link active' : 'nav-link'}
          >
            📋 Quy trình
          </Link>
          
          <Link 
            to="/chat" 
            className={location.pathname === '/chat' ? 'nav-link active' : 'nav-link'}
          >
            💬 Chat AI
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="welcome-text">
                👋 Xin chào!
              </span>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Đăng xuất
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <Link 
                to="/signin" 
                className="auth-link signin"
              >
                🔑 Đăng nhập
              </Link>
              <Link 
                to="/signup" 
                className="auth-link signup"
              >
                📝 Đăng ký
              </Link>
            </div>
          )}
          
          {/* Admin Link */}
          {isAdmin ? (
            <Link to="/admin" className="admin-link">
              ⚙️ Admin
            </Link>
          ) : (
            <Link to="/admin" className="admin-link-hidden">
              ⚙️
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
