import React from 'react';

// Ô nhập tin nhắn và nút gửi
// Props:
// - value: giá trị hiện tại của ô nhập
// - onChange: (text) => void — cập nhật giá trị
// - onSubmit: (event) => void — gửi tin nhắn
// - isLoading: boolean — đang chờ phản hồi AI, disable input/nút
const MessageInput = ({ value, onChange, onSubmit, isLoading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="message-input">
      <div className="input-container">
  <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          className="message-field"
        />
        <button 
          type="submit" 
          disabled={isLoading || !value.trim()}
          className="send-btn"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
