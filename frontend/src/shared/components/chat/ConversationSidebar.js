import React from 'react';

const ConversationSidebar = ({ 
  conversations, 
  activeConversationId, 
  onSelectConversation, 
  onDeleteConversation, 
  onCreateNew 
}) => {
  return (
    <div className="conversation-sidebar">
      <div className="sidebar-header">
        <h3> Cuộc trò chuyện</h3>
        <button onClick={onCreateNew} className="new-chat-btn">
          ➕ Mới
        </button>
      </div>
      
      <div className="conversations">
        {conversations.length === 0 ? (
          <div className="empty-state">
            <p>Chưa có cuộc trò chuyện nào</p>
            <button onClick={onCreateNew} className="start-chat-btn">
              Bắt đầu chat
            </button>
          </div>
        ) : (
          conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${activeConversationId === conv.id ? 'active' : ''}`}
              onClick={() => onSelectConversation(conv.id)}
            >
              <div className="conv-content">
                <h4>{conv.title}</h4>
                <p>{conv.messages.length} tin nhắn</p>
                <small>{new Date(conv.updatedAt).toLocaleString()}</small>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="delete-btn"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConversationSidebar;
