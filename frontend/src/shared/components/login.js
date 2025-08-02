import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../index.css';

function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
       // console.log('Login attempted with:', { email, password });
        
        // Kiểm tra đơn giản - thực tế nên gọi API đăng nhập
        if (email === 'admin@example.com' && password === '123456') {
            console.log('Đăng nhập thành công');
            //navigate('/user'); // <-- ĐIỀU HƯỚNG ĐẾN TRANG AIChat
            navigate('/admin');
        }
        else if (email === 'user1@gmail.com' && password === '12345678') {
                console.log('Đăng nhập thành công');
                navigate('/user'); // <-- ĐIỀU HƯỚNG ĐẾN TRANG AIChat
            }
        else {
            alert('Email hoặc mật khẩu không đúng!');
        }

    };

    return (
        <div className="login-container" id="login-container">
            <div className="login-card" id="login-card">
                <h2 className="login-title">Đăng Nhập</h2>
                <form>
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
                        />
                    </div>
                    <div id="button-group">
                        <button
                            onClick={handleSubmit}
                            className="login-button"
                            type="submit"
                        >
                            Đăng Nhập
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
export default LoginForm;
