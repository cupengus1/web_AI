import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components from feature-based structure
import DashboardPage from './features/dashboard/pages/DashboardPage';
import Homepage from './features/homepage/pages/Homepage';
import SignUpPage from './features/auth/pages/SignUpPage';
import SignInPage from './features/auth/pages/SignInPage';
import ChatPage from './features/chat/pages/ChatPage';
import DashboardLayout from './shared/layouts/dashboardLayout/DashboardLayout';
import AdminDashboard from './features/admin/pages/AdminDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        
        {/* Dashboard Layout Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
        </Route>
        
        <Route path="/chat" element={<DashboardLayout />}>
          <Route index element={<ChatPage />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
