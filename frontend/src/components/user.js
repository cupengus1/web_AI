import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import '../index.css';

function AIChat() {
            const [question, setQuestion] = useState('');
            const [response, setResponse] = useState('');
            const [isLoading, setIsLoading] = useState(false);
            const [isMenuOpen, setIsMenuOpen] = useState(false);
            const navigate = useNavigate();

            const handleSubmit = async (e) => {
                e.preventDefault();
                if (!question.trim()) return;

                setIsLoading(true);
                setResponse('');

                try {
                    const response = await fetch('http://localhost:8080/ask', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            question: question
                        })
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    setResponse(data.answer || 'Không có phản hồi từ AI');
                } catch (error) {
                    console.error('Error calling API:', error);
                    setResponse('Đã xảy ra lỗi khi gọi API. Vui lòng kiểm tra kết nối và thử lại.');
                } finally {
                    setIsLoading(false);
                }
            };
            //Nút menu icon đăng nhập, đăng ký
            const toggleMenu = () => {
                setIsMenuOpen(!isMenuOpen);
            };
            const handleLoginClick = () => {
                setIsMenuOpen(false);
                navigate('/login');
            };
            return (
                <div id ="AI-container">
                    {/* Thêm header cho trang */}
                    <header className="header">
                        <div className="logo-container">
                            <Link to="/user" className="logo"> AI-D-K </Link>
                        </div>
                        <div className="auth-container">
                            <button className="auth-icon" onClick = {toggleMenu} id="auth-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                className="icon">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"></path>
                                    <path d="M12 13c-3.31 0-6 2.69-6 6v1h12v-1c0-3.31-2.69-6-6-6z"></path>
                                </svg>
                            </button>
                        {isMenuOpen && (
                            <div className="auth-menu">
                            <button className="login-button-user" id="login-button-user" onClick={handleLoginClick}>
                               <a href=""></a> Đăng nhập
                            </button>
                            <button className="register-button" id="register-button">
                                Đăng ký
                            </button>
                        </div>
                        )}
                        </div>
                    </header>

                    <div id="AI-card">
                        <h2 id="AI-title">Trò chuyện với AI</h2>
                        <form onSubmit={handleSubmit} id="AI-form">
                            <div id="question-group">
                                <label htmlFor="question" id="question-label">
                                    Câu hỏi của bạn
                                </label>
                                <textarea
                                    id="question-input"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="Nhập câu hỏi của bạn..."
                                    rows="4"
                                    required
                                    
                                />
                            </div>
                            <div  id="button-group">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={isLoading ? ' opacity-50 cursor-not-allowed' : ''}
                                    id="submit-button"
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Gửi câu hỏi'}
                                    
                                </button>
                            </div>
                        </form>
                        {response && (
                            <div id="response-section">
                                <h3 id="response-title">Phản hồi từ AI:</h3>
                                <p  id="response-text">{response}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

export default AIChat;