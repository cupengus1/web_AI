import React, { useState } from 'react';
import { forgotPassword } from '../../../shared/api/api';
import "./SignInPage.css"; // tái sử dụng CSS đăng nhập

function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);

        try {
            const response = await forgotPassword(email);
            console.log('Yêu cầu đặt lại mật khẩu:', response);
            setSuccess('Vui lòng kiểm tra email để đặt lại mật khẩu.');
        } catch (error) {
            console.error('Lỗi khi gửi yêu cầu đặt lại mật khẩu:', error);
            setError('Không thể gửi yêu cầu. Vui lòng thử lại!');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-container" id="forgot-password-container">
            <div className="login-card" id="forgot-password-card">
                <h2 className="login-title">Quên Mật Khẩu</h2>

                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" id="email-group">
                        <label className="form-label" htmlFor="email">
                            Nhập Email đã đăng ký
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
                    <div id="button-group">
                        <button
                            className="login-button"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                        </button>
                        <a href="/signin" className="forgot-password">
                            Quay lại đăng nhập
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ForgotPasswordPage;
