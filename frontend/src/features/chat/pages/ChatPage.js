import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'react-router-dom'
import NewPrompt from '../../../shared/components/newPrompt/NewPrompt';
import { publicChat } from '../../../shared/api/api'
import './ChatPage.css'

const ChatPage = () => {
  const { chatId } = useParams();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load lịch sử chat từ localStorage khi mở lại
  useEffect(() => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    const selectedChat = chatHistory.find(chat => chat.id === chatId);
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    }
  }, [chatId]);

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
      const updatedHistory = chatHistory.map(chat =>
        chat.id === chatId ? { ...chat, messages: [...(chat.messages || []), userMessage, aiMessage] } : chat
      );
      localStorage.setItem('chatHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('❌ API Error:', error);
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
              {msg.content}
            </div>
          ))}
          {isLoading && <div className='message ai'>AI đang suy nghĩ...</div>}
          <NewPrompt onSendMessage={handleSendMessage} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

export default ChatPage
