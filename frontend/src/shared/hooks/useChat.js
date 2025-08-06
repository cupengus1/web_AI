import { useState, useEffect, useCallback } from 'react';
import { chatWithAI } from '../api/api';

export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [currentMessages, setCurrentMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Debug helper
  const debug = (action, data) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`🐛 Chat Debug [${action}]:`, data);
    }
  };

  const generateId = () => Date.now().toString();

  const showError = useCallback((err) => {
    const errorMsg = err.message || 'Có lỗi xảy ra';
    debug('ERROR', errorMsg);
    setError(errorMsg);
    setTimeout(() => setError(''), 5000);
  }, []);

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

  const deleteConversation = useCallback((convId) => {
    if (window.confirm('Bạn có chắc muốn xóa cuộc trò chuyện này?')) {
      debug('DELETE_CONVERSATION', convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConversationId === convId) {
        setActiveConversationId(null);
        setCurrentMessages([]);
      }
    }
  }, [activeConversationId]);

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
    setIsLoading(true);

    // Update title với message đầu tiên
    if (updatedMessages.length === 1) {
      updateConversationTitle(convId, userMessage.content);
    }

    try {
      debug('CALLING_AI', userMessage.content);
      const response = await chatWithAI(userMessage.content);
      const aiContent = response.data?.content || 
                       response.data?.answer || 
                       'Xin lỗi, tôi không thể trả lời câu hỏi này.';

      const aiMessage = {
        id: generateId(),
        content: aiContent,
        type: 'ai',
        timestamp: new Date()
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setCurrentMessages(finalMessages);

      // Update conversation
      setConversations(prev => prev.map(conv => 
        conv.id === convId 
          ? { ...conv, messages: finalMessages, updatedAt: new Date() }
          : conv
      ));

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
  }, [activeConversationId, currentMessages, updateConversationTitle, showError]);

  // Load conversations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chatConversations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        debug('LOAD_CONVERSATIONS', parsed);
        setConversations(parsed);
        if (parsed.length > 0) {
          setActiveConversationId(parsed[0].id);
          setCurrentMessages(parsed[0].messages);
        }
      } catch (error) {
        debug('LOAD_ERROR', error);
      }
    }
  }, []);

  // Save conversations
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('chatConversations', JSON.stringify(conversations));
      debug('SAVE_CONVERSATIONS', conversations);
    }
  }, [conversations]);

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
