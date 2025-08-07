import { useState, useEffect, useCallback } from 'react';
import { sendChatMessage, getChatHistory, deleteChatConversation as deleteChatAPI } from '../api/api';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Helper function to generate unique IDs
  const generateId = () => Date.now().toString();

  // Debug helper
  const debug = (action, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 Chat Debug [${action}]:`, data);
    }
  };

  // Check if user is logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  // Load conversations from localStorage
  const loadLocalConversations = useCallback(() => {
    const saved = localStorage.getItem('chatConversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        debug('LOAD_LOCAL_CONVERSATIONS', parsed);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
          setCurrentMessages(parsed[0].messages);
        }
      } catch (error) {
        debug('LOAD_LOCAL_ERROR', error);
      }
    }
  }, []);

  // Load conversations from server if logged in, otherwise from localStorage
  const loadConversations = useCallback(async () => {
    if (isLoggedIn) {
      try {
        const response = await getChatHistory();
        const serverConversations = response.data.conversations || [];
        
        // Convert MongoDB format to client format
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
        }
        
        debug('LOAD_SERVER_CONVERSATIONS', clientConversations);
      } catch (error) {
        debug('LOAD_SERVER_ERROR', error);
        // Fall back to localStorage
        loadLocalConversations();
      }
    } else {
      loadLocalConversations();
    }
  }, [isLoggedIn, loadLocalConversations]);

  const createNewConversation = useCallback(() => {
    debug('CREATE_CONVERSATION', 'Creating new conversation');
    const newConv = {
      id: generateId(),
      title: 'Cuộc trò chuyện mới',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConv.id);
    setCurrentMessages([]);
    debug('CREATE_CONVERSATION_SUCCESS', newConv);
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

    // Tạo conversation nếu chưa có
    let convId = activeConversationId;
    if (!convId) {
      const newConv = {
        id: generateId(),
        title: 'Cuộc trò chuyện mới',
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setConversations(prev => [newConv, ...prev]);
      convId = newConv.id;
      setActiveConversationId(convId);
    }

    const userMessage = {
      id: generateId(),
      content: messageText.trim(),
      type: 'user',
      timestamp: new Date()
    };

    const updatedMessages = [...currentMessages, userMessage];
    setCurrentMessages(updatedMessages);

    // Update title với message đầu tiên
    if (updatedMessages.length === 1) {
      updateConversationTitle(convId, userMessage.content);
    }

    try {
      debug('CALLING_AI', userMessage.content);
      
      let response;
      if (isLoggedIn) {
        // For logged in users, pass conversation ID if exists for MongoDB storage
        const conversationIdForServer = convId && convId.length === 24 ? convId : null;
        response = await sendChatMessage(userMessage.content, conversationIdForServer);
      } else {
        // For anonymous users, use public endpoint
        response = await sendChatMessage(userMessage.content);
      }

      // Handle different response formats for authenticated vs anonymous users
      let aiContent;
      if (isLoggedIn) {
        aiContent = response.data?.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
      } else {
        aiContent = response.data?.answer || response.data?.response || 'Xin lỗi, tôi không thể trả lời câu hỏi này.';
      }

      const aiMessage = {
        id: generateId(),
        content: aiContent,
        type: 'ai',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setCurrentMessages(finalMessages);

      // If logged in and server returned a conversation, update our state with server data
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
      } else {
        // Update local conversation (for anonymous users or when server doesn't return conversation)
        setConversations(prev => prev.map(conv => 
          conv.id === convId 
            ? { ...conv, messages: finalMessages, updatedAt: new Date() }
            : conv
        ));
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
      
      setConversations(prev => prev.map(conv => 
        conv.id === convId 
          ? { ...conv, messages: finalMessages, updatedAt: new Date() }
          : conv
      ));
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId, currentMessages, updateConversationTitle, showError, isLoggedIn]);

  // Load conversations when component mounts or login status changes
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Save conversations to localStorage for anonymous users
  useEffect(() => {
    if (!isLoggedIn && conversations.length > 0) {
      localStorage.setItem('chatConversations', JSON.stringify(conversations));
      debug('SAVE_CONVERSATIONS_LOCAL', conversations);
    }
  }, [conversations, isLoggedIn]);

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
