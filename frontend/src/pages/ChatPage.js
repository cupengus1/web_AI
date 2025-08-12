import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatPage.css';

// Hooks
import { useChat } from '../shared/hooks/useChat';

// Components
import MessageList from '../shared/components/chat/MessageList';
import MessageInput from '../shared/components/chat/MessageInput';
import ConversationSidebar from '../shared/components/chat/ConversationSidebar';

// Trang Chat chính: bố cục gồm Sidebar (danh sách cuộc trò chuyện) và Khu vực chat (tin nhắn + ô nhập)
const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Nếu được điều hướng từ nơi khác với câu hỏi ban đầu, tự động điền vào ô nhập
    if (location.state?.initialQuestion) {
      setNewMessage(location.state.initialQuestion);
      // Xoá state để tránh tự điền lại khi refresh/trở lại trang
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate]);
  
  const {
    conversations,
    activeConversationId,
    currentMessages,
    isLoading,
    error,
    setError,
    createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage
  } = useChat();

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    await sendMessage(newMessage);
    setNewMessage('');
  };

  const handleLogout = () => {
    // Đăng xuất: xoá các token lưu cục bộ
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    // Điều hướng về trang chủ
    navigate('/');
  };

  return (
    <div className="chat-page">
      {error && (
        <div className="error-toast">
          {error}
          {/* Nút đóng thông báo lỗi */}
          <button onClick={() => setError('')} aria-label="Đóng" title="Đóng">×</button>
        </div>
      )}

      <div className="chat-layout">
        {/* Sidebar: danh sách cuộc trò chuyện */}
        <aside className="chat-sidebar">
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={selectConversation}
            onDeleteConversation={deleteConversation}
            onCreateNew={createNewConversation}
          />
        </aside>
        
        {/* Khu vực chat chính */}
        <main className="chat-main">
          <header className="chat-header">
            <h1>🤖 Trợ lý AI</h1>
            <div className="header-actions">
            </div>
          </header>

          <div className="chat-content">
            <MessageList 
              messages={currentMessages} 
              isLoading={isLoading} 
            />
          </div>
          
          <footer className="chat-footer">
            <MessageInput
              value={newMessage}
              onChange={setNewMessage}
              onSubmit={handleSendMessage}
              isLoading={isLoading}
            />
          </footer>
        </main>
      </div>
    </div>
  );
};

export default ChatPage;
