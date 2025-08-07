import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Header from './shared/components/layout/Header';
import { useLocation } from 'react-router-dom';
import Homepage from './features/homepage/pages/Homepage';
import SignUpPage from './features/auth/pages/SignUpPage';
import SignInPage from './features/auth/pages/SignInPage';
import AdminDashboardCompact from './features/admin/pages/AdminDashboardCompact';
import ForgotPasswordPage from './features/auth/pages/ForgotPassPage';
import ChatPage from './pages/ChatPage';
import ProceduresPage from './features/procedures/pages/ProceduresPage';

function App() {
  const location = useLocation();
  return (
    <>
      {/* Only show Header if not on homepage, admin, signin, signup, forgot-password */}
      {![
        '/',
        '/signin',
        '/signup',
        '/forgot-password'
      ].includes(location.pathname) && !location.pathname.startsWith('/admin') && <Header />}
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Chat routes */}
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/dashboard" element={<ChatPage />} />
        
        {/* Procedures routes */}
        <Route path="/procedures" element={<ProceduresPage />} />
        
        {/* Admin routes */}
        <Route path="/admin" element={<AdminDashboardCompact />} />
      </Routes>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);
