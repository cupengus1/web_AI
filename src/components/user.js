import React, { useState } from "react";

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
                    // Giả lập API call - Thay bằng API thực tế của bạn
                    await new Promise(resolve => setTimeout(resolve, 1000)); // Giả lập độ trễ
                    const mockResponse = `Đây là phản hồi giả lập cho câu hỏi: "${question}"`;
                    setResponse(mockResponse);
                } catch (error) {
                    setResponse('Đã xảy ra lỗi. Vui lòng thử lại.');
                } finally {
                    setIsLoading(false);
                }
            };

            return (
                <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
                    <div className="w-full max-w-2xl bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Trò chuyện với AI</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label htmlFor="question" className="block text-gray-700 text-sm font-bold mb-2">
                                    Câu hỏi của bạn
                                </label>
                                <textarea
                                    id="question"
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nhập câu hỏi của bạn..."
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="flex justify-center">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                                        isLoading ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                >
                                    {isLoading ? 'Đang xử lý...' : 'Gửi câu hỏi'}
                                </button>
                            </div>
                        </form>
                        {response && (
                            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Phản hồi từ AI:</h3>
                                <p className="text-gray-700">{response}</p>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

export default AIChat;