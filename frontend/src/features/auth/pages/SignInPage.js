import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, adminLogin } from '../../../shared/api/api';
import "./SignInPage.css"

function SignInPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Thử đăng nhập admin trước
            try {
                const adminResponse = await adminLogin(email, password);
                console.log('Admin login successful');
                localStorage.setItem("adminToken", adminResponse.data.token);
                navigate('/admin');
                return;
            } catch (adminError) {
                // Nếu không phải admin, thử đăng nhập user
                console.log('Not admin, trying user login...');
            }

            // Thử đăng nhập user
            const userResponse = await login(email, password);
            console.log('User login successful');
            localStorage.setItem("token", userResponse.data.token);
            navigate('/dashboard');

        } catch (error) {
            console.error('Login error:', error);
            setError('Email hoặc mật khẩu không đúng!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" id="login-container">
            <div className="login-card" id="login-card">
                <h2 className="login-title">Đăng Nhập</h2>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" id="email-group">
                        <label className="form-label" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="form-input"
                            placeholder="Nhập email của bạn"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div className="form-group" id="password-group">
                        <label className="form-label" htmlFor="password">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="form-input"
                            placeholder="Nhập mật khẩu"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    <div id="button-group">
                        <button
                            className="login-button"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng Nhập'}
                        </button>
                        <a href="/forgot-password" className="forgot-password">
                            Quên mật khẩu
                        </a>
                    </div>
                </form>
                <div className="signup-link">
                    Bạn chưa có tài khoản? <a href="/signup">Đăng ký ngay</a>
                </div>
            </div>
        </div>
    );
}

export default SignInPage;
