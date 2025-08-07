import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is logged in and get user data
  const userToken = localStorage.getItem('token');
  const isLoggedIn = !!userToken;
  
  // Decode JWT to get user role
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
    localStorage.removeItem('token');
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
        <div to="/" className="logo">
          <span className="logo-text">kd.AI</span>
        </div>

        {/* Navigation - remove nav-links */}
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

        {/* Auth Section */}
        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="welcome-text">
                Xin chào!
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
          
          {/* Admin Link - only show for admin users */}
          {isAdmin && (
            <Link to="/admin" className="admin-link">
              Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
