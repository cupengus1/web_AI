import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage, getChatHistory, deleteChatConversation as deleteChatAPI } from '../api/api';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Hàm tạo ID tạm (chỉ để hiển thị tạm thời trong UI)
  const generateId = () => Date.now().toString();

  // Hàm log debug (chỉ hoạt động ở môi trường development)
  const debug = (action, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 Chat Debug [${action}]:`, data);
    }
  };

  // Kiểm tra trạng thái đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Đã loại bỏ chế độ cục bộ (localStorage)
  // Với người dùng chưa đăng nhập: giữ nguyên khung chat hiện tại, không reset messages
  const loadLocalConversations = useCallback(() => {
    setConversations([]);
    setActiveConversationId(null);
    // Không xóa currentMessages để tránh trở lại giao diện chờ trong khi đang chat ẩn danh
  }, []);

  // Tải hội thoại từ máy chủ
  const loadConversations = useCallback(async () => {
    // Người dùng chưa đăng nhập: không gọi API lịch sử, giữ nguyên trạng thái hiện tại
    if (!isLoggedIn) {
      loadLocalConversations();
      return;
    }
    try {
      const response = await getChatHistory();
      const serverConversations = response.data.conversations || [];
      const clientConversations = serverConversations.map(conv => ({
        id: conv.id || conv._id,
        title: conv.title,
        messages: conv.messages.map(msg => ({
          id: msg.id || msg._id,
          content: msg.content,
          type: msg.role === 'user' ? 'user' : 'ai',
          timestamp: new Date(msg.timestamp)
        })),
        createdAt: new Date(conv.created_at || conv.createdAt),
        updatedAt: new Date(conv.updated_at || conv.updatedAt)
      }));
      setConversations(clientConversations);
      if (clientConversations.length > 0) {
        setActiveConversationId(clientConversations[0].id);
        setCurrentMessages(clientConversations[0].messages);
      } else {
        setActiveConversationId(null);
        setCurrentMessages([]);
      }
      debug('LOAD_SERVER_CONVERSATIONS', clientConversations);
    } catch (error) {
      debug('LOAD_SERVER_ERROR', error);
      // Không reset khung chat khi lỗi (ví dụ 400/401) để tránh nhảy về giao diện chờ
    }
  }, [isLoggedIn, loadLocalConversations]);

  // Đã loại bỏ chức năng nhập (import) hội thoại từ localStorage

  const createNewConversation = useCallback(() => {
    // Máy chủ sẽ tạo hội thoại khi gửi tin nhắn đầu tiên
    debug('CREATE_CONVERSATION', 'Chuẩn bị hội thoại mới');
    setActiveConversationId(null);
    setCurrentMessages([]);
  }, []);

  const selectConversation = useCallback((convId) => {
    debug('SELECT_CONVERSATION', convId);
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setActiveConversationId(convId);
      setCurrentMessages(conv.messages);
    }
  }, [conversations]);

  const showError = useCallback((err) => {
    const errorMsg = err.message || 'Có lỗi xảy ra';
    debug('ERROR', errorMsg);
    setError(errorMsg);
    setTimeout(() => setError(''), 5000);
  }, []);

  const deleteConversation = useCallback(async (convId) => {
    if (window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
      debug('DELETE_CONVERSATION', convId);
      
      // If logged in, delete from server
      if (isLoggedIn) {
        try {
          await deleteChatAPI(convId);
        } catch (error) {
          showError(error);
          return;
        }
      }
      
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setCurrentMessages([]);
      }
    }
  }, [activeConversationId, isLoggedIn, showError]);

  const updateConversationTitle = useCallback((convId, firstMessage) => {
    const title = firstMessage.length > 30 
      ? firstMessage.substring(0, 30) + '...' 
      : firstMessage;
      
    debug('UPDATE_TITLE', { convId, title });
    setConversations(prev => prev.map(conv => 
      conv.id === convId 
        ? { ...conv, title, updatedAt: new Date() }
        : conv
    ));
  }, []);

  const sendMessage = useCallback(async (messageText) => {
    if (!messageText.trim()) return;

    debug('SEND_MESSAGE', messageText);
    setIsLoading(true);
    setError('');

  // Máy chủ sẽ tạo cuộc trò chuyện nếu chưa có
  const convId = activeConversationId;

    const userMessage = {
      id: generateId(),
      content: messageText.trim(),
      type: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...currentMessages, userMessage];
    setCurrentMessages(updatedMessages);

  // Cập nhật tiêu đề với tin nhắn đầu tiên
    if (updatedMessages.length === 1) {
      updateConversationTitle(convId, userMessage.content);
    }

    try {
      debug('CALLING_AI', userMessage.content);
      
  const conversationIdForServer = convId && convId.length === 24 ? convId : null;
  const response = await sendChatMessage(userMessage.content, conversationIdForServer);

  // Xử lý nội dung trả về
  const aiContent = response.data?.response || response.data?.answer || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';

      const aiMessage = {
        id: generateId(),
        content: aiContent,
        type: 'ai',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setCurrentMessages(finalMessages);

  // Cập nhật state theo dữ liệu từ máy chủ nếu có (chỉ áp dụng khi đã đăng nhập)
      if (isLoggedIn && response.data?.conversation) {
        const serverConv = response.data.conversation;
        const updatedConv = {
          id: serverConv.id || serverConv._id,
          title: serverConv.title,
          messages: serverConv.messages.map(msg => ({
            id: msg.id || msg._id,
            content: msg.content,
            type: msg.role === 'user' ? 'user' : 'ai',
            timestamp: new Date(msg.timestamp)
          })),
          createdAt: new Date(serverConv.created_at || serverConv.createdAt),
          updatedAt: new Date(serverConv.updated_at || serverConv.updatedAt)
        };

        setConversations(prev => prev.map(conv => 
          conv.id === convId ? updatedConv : conv
        ));
        setActiveConversationId(updatedConv.id);
        setCurrentMessages(updatedConv.messages);
      } else if (isLoggedIn) {
        // Dự phòng: tải lại toàn bộ lịch sử để đồng bộ (đã đăng nhập)
        await loadConversations();
      }

      debug('AI_RESPONSE_SUCCESS', aiMessage);

    } catch (error) {
      debug('AI_ERROR', error);
      showError(error);
      
  const errorMessage = {
        id: generateId(),
        content: 'Xin lỗi, có lỗi xảy ra khi kết nối với AI. Vui lòng thử lại.',
        type: 'ai',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, errorMessage];
      setCurrentMessages(finalMessages);
      
  // Giữ bong bóng lỗi trong khung chat
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, currentMessages, updateConversationTitle, showError, isLoggedIn, loadConversations]);

  // Load conversations when component mounts or login status changes
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Removed: no local persistence

  return {
    // State
    conversations,
    activeConversationId,
    currentMessages,
    isLoading,
    error,
    setError,
    
    // Actions
    createNewConversation,
    selectConversation,
    deleteConversation,
    sendMessage
  };
};
