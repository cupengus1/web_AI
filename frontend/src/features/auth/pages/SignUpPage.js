import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { register } from '../../../shared/api/api';
import "./SignInPage.css"; // tái sử dụng CSS cũ cho đồng bộ

function SignUpPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp!');
            return;
        }

        setIsLoading(true);

        try {
            const response = await register(name, email, password);
            console.log('Đăng ký thành công:', response);
            setSuccess('Đăng ký thành công! Vui lòng đăng nhập.');
            setTimeout(() => navigate('/signin'), 2000);
        } catch (error) {
            console.error('Đăng ký lỗi:', error);
            setError('Đăng ký thất bại. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" id="signup-container">
            <div className="login-card" id="signup-card">
                <h2 className="login-title">Đăng Ký</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" id="name-group">
                        <label className="form-label" htmlFor="name">
                            Họ và tên
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="form-input"
                            placeholder="Nhập họ và tên"
                            required
                            disabled={isLoading}
                        />
                    </div>
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
                            placeholder="Nhập email"
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
                    <div className="form-group" id="confirm-password-group">
                        <label className="form-label" htmlFor="confirmPassword">
                            Xác nhận mật khẩu
                        </label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="form-input"
                            placeholder="Nhập lại mật khẩu"
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
                            {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
                        </button>
                        <div className="signup-link">
                            Bạn đã có tài khoản? <a href="/signin">Đăng nhập ngay</a>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default SignUpPage;
