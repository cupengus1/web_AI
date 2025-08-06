import React from 'react';

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
