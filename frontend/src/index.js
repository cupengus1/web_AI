import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components from feature-based structure
import LoginForm from './shared/components/login';
// import AIChat from './shared/components/user'; // Temporarily commented out
import AdminDashboard from './features/admin/pages/AdminDashboard';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import Homepage from './features/homepage/pages/Homepage';
import SignUpPage from './features/auth/pages/SignUpPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* <Route path="/user" element={<AIChat />} /> */}
        <Route path="/signup" element={<SignUpPage />} />
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
