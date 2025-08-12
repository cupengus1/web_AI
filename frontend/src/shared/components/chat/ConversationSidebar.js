import React from 'react';

// Sidebar hiển thị danh sách cuộc trò chuyện và cho phép tạo/xoá/chọn cuộc trò chuyện
// Props:
// - conversations: danh sách các cuộc trò chuyện { id, title, messages[], updatedAt }
// - activeConversationId: id cuộc trò chuyện đang chọn
// - onSelectConversation: (id) => void — chọn 1 cuộc trò chuyện
// - onDeleteConversation: (id) => void — xoá 1 cuộc trò chuyện
// - onCreateNew: () => void — tạo cuộc trò chuyện mới
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
              // Chọn cuộc trò chuyện khi click vào toàn bộ item
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
                  // Ngăn click lan ra ngoài và gọi xoá cuộc trò chuyện
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
