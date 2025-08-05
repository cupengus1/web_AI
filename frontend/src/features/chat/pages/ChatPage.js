import { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import NewPrompt from '../../../shared/components/newPrompt/NewPrompt';
import { publicChat } from '../../../shared/api/api'
import './ChatPage.css'
import '../../../index.css'
const ChatPage = () => {
  const { chatId } = useParams();
  const location = useLocation(); // Thêm dòng này
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);
  const hasInitialized = useRef(false); // Thêm dòng này

  // Scroll xuống cuối khi có tin nhắn mới
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Load lịch sử chat từ localStorage khi mở lại
  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    }
  }, [chatId]);
// Xử lý initialQuestion khi vừa chuyển sang trang chat
  useEffect(() => {
    const initialQuestion = location.state?.initialQuestion;
    if (initialQuestion && !hasInitialized.current) {
      hasInitialized.current = true;
      handleSendMessage(initialQuestion);
    }
  // eslint-disable-next-line
  }, [location.state, chatId]); // Bỏ handleSendMessage khỏi deps để tránh lặp vô hạn

  const handleSendMessage = useCallback(async (question) => {
    if (!question.trim()) return;

    const userMessage = { type: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await publicChat(question);
      const aiMessage = { type: 'ai', content: response.data.answer };
      setMessages(prev => [...prev, aiMessage]);

      // Cập nhật lịch sử chat
  const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
  const chatIdx = chatHistory.findIndex(chat => chat.id === chatId);
  const newMessages = [...(chatHistory[chatIdx]?.messages || messages), userMessage, aiMessage];
  const newChat = {
      id: chatId,
      title: messages[0]?.content || question.substring(0, 30),
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      messages: newMessages
      };
      if (chatIdx >= 0) {
        chatHistory[chatIdx] = newChat;
      } else {
        chatHistory.unshift(newChat);
      }
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    } catch (error) {
      console.error('❌ API Error:', error);
      const errorMessage = { type: 'error', content: 'Có lỗi xảy ra khi gọi AI. Vui lòng thử lại.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [chatId]);

  return (
    <div className='chatPage'>
      <div className='wrapper'>
        <div className='chat'>
          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.type}`}>
              {msg.type === 'ai'
                ? <div className="ai-message-content">{msg.content}</div>
                : msg.content}
            </div>
          ))}
          {isLoading && (
            <div className='message ai loading'>
              AI đang suy nghĩ...
            </div>
          )}
          <div ref={chatEndRef}></div>
          
        </div>
      </div>
      <div className="formContainer">
        <NewPrompt onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  )
}

export default ChatPage
