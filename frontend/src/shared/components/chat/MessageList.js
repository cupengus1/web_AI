import React from 'react';

// Function để format text AI cho dễ đọc
const formatAIResponse = (text) => {
  if (!text) return '';
  
  let formatted = text
    // Thay thế ### thành heading
    .replace(/###\s*(.+)/g, '<h4>$1</h4>')
    // Thay thế ** bold text **
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Thay thế * italic text * (nhưng tránh conflict với **)
    .replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>')
    // Xử lý numbered list
    .replace(/(\d+)\.\s+(.+?)(?=\n|$)/g, '<div class="list-item"><strong>$1.</strong> $2</div>')
    // Xử lý bullet points
    .replace(/^-\s+(.+?)(?=\n|$)/gm, '<div class="bullet-item">• $1</div>')
    // Chia đoạn văn dài thành paragraphs
    .replace(/\n\n+/g, '</p><p>')
    // Thay \n đơn thành <br/>
    .replace(/\n/g, '<br/>')
    // Wrap trong paragraphs
    .replace(/^(.+)$/, '<p>$1</p>')
    // Làm sạch các ký tự markdown thừa
    .replace(/#{3,}/g, '')
    .replace(/\*{3,}/g, '');

  return formatted;
};

const MessageList = ({ messages, isLoading }) => {
  if (messages.length === 0) {
    return (
      <div className="welcome-message">
        <h2>Xin chào!</h2>
        <p>Tôi là kd.AI. Hãy hỏi tôi bất cứ điều gì!</p>
        <div className="suggestions">
          <div className="suggestion">Quy trình làm việc</div>
          <div className="suggestion">Chính sách công ty</div>
          <div className="suggestion">Hướng dẫn hệ thống</div>
        </div>
      </div>
    );
  }

  return (
    <div className="message-list">
      {messages.map(message => (
        <div key={message.id} className={`message ${message.type}`}>
          <div className="message-avatar">
            {message.type === 'user' ? '👤' : '🤖'}
          </div>
          <div className="message-content">
            <div 
              className="message-text"
              dangerouslySetInnerHTML={{
                __html: message.type === 'ai' 
                  ? formatAIResponse(message.content)
                  : message.content
              }}
            />
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
      
      {isLoading && (
        <div className="message ai">
          <div className="message-avatar">🤖</div>
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
