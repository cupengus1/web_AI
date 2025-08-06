import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatPage.css';

// Hooks
import { useChat } from '../shared/hooks/useChat';

// Components
import MessageList from '../shared/components/chat/MessageList';
import MessageInput from '../shared/components/chat/MessageInput';
import ConversationSidebar from '../shared/components/chat/ConversationSidebar';

const ChatPage = () => {
  const [newMessage, setNewMessage] = useState('');
  const navigate = useNavigate();
  
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
    // Clear user data
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('chatConversations');
    
    // Redirect to homepage
    navigate('/');
  };

  return (
    <div className="chat-page">
      {error && (
        <div className="error-toast">
          {error}
          <button onClick={() => setError('')}>×</button>
        </div>
      )}

      <div className="chat-layout">
        {/* Sidebar */}
        <aside className="chat-sidebar">
          <ConversationSidebar
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={selectConversation}
            onDeleteConversation={deleteConversation}
            onCreateNew={createNewConversation}
          />
        </aside>
        
        {/* Main Chat */}
        <main className="chat-main">
          <header className="chat-header">
            <h1>🤖 AI Assistant</h1>
            <div className="header-actions">
              <button onClick={createNewConversation} className="new-chat-header-btn">
                ➕ Tạo mới
              </button>
              <button onClick={handleLogout} className="logout-btn">
                🚪 Đăng xuất
              </button>
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
