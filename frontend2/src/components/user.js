import React, { useState } from "react";
import '../index.css';

function AIChat() {
            const [question, setQuestion] = useState('');
            const [response, setResponse] = useState('');
            const [isLoading, setIsLoading] = useState(false);

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

            return (
                <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4" id ="AI-container">
                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6" id="AI-card">
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800" id="AI-title">Trò chuyện với AI</h2>
                        <form onSubmit={handleSubmit} id="AI-form">
                            <div className="mb-4" id="question-group">
                                <label htmlFor="question" className="block text-gray-700 text-sm font-bold mb-2" id="question-label">
                                    Câu hỏi của bạn
                                </label>
                                <textarea
                                    id="question-input"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập câu hỏi của bạn..."
                                    rows="4"
                                    required
                                    
                                />
                            </div>
                            <div className="flex justify-center" id="button-group">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                    id="submit-button"
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Gửi câu hỏi'}
                                    
                                </button>
                            </div>
                        </form>
                        {response && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg" id="response-section">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phản hồi từ AI:</h3>
                                <p className="text-gray-700" id="response-text">{response}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

export default AIChat;