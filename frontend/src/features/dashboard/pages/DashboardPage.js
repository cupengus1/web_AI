import './DashboardPage.css'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import NewPrompt from '../../../shared/components/newPrompt/NewPrompt'
import { publicChat } from '../../../shared/api/api'

const DashboardPage = () => {
  const { chatId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (chatId) {
      const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]')
      const chat = chatHistory.find(c => c.id === chatId)
      if (chat) {
        setMessages(chat.messages)
      }
    }
  }, [chatId])

  const saveChatHistory = (title, msgs) => {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]')
    const newChat = {
      id: chatId,
      title,
      date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString(),
      messages: msgs
    }
    const idx = chatHistory.findIndex(c => c.id === chatId)
    if (idx >= 0) chatHistory[idx] = newChat
    else chatHistory.unshift(newChat)
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
  }

  const handleSendMessage = useCallback(async (question) => {
    if (!question.trim()) return

    if (!chatId) {
      const newChatId = `chat_${Date.now()}`
      navigate(`/dashboard/chats/${newChatId}`, { state: { initialQuestion: question } })
      return
    }

    const userMessage = { type: 'user', content: question }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setIsLoading(true)

    try {
      const response = await publicChat(question)
      const aiMessage = { type: 'ai', content: response.data.answer }
      const finalMessages = [...updatedMessages, aiMessage]
      setMessages(finalMessages)

      saveChatHistory(
        messages[0]?.content || question.substring(0, 30),
        finalMessages
      )
    } catch (error) {
      const errorMessage = { type: 'error', content: 'Có lỗi xảy ra, thử lại.' }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, chatId, navigate])

  useEffect(() => {
    const initialQuestion = location.state?.initialQuestion
    if (initialQuestion && !hasInitialized.current && chatId) {
      hasInitialized.current = true
      handleSendMessage(initialQuestion)
    }
  }, [location.state, chatId, handleSendMessage])

  return (
    <div className='dashboardPage'>
      <div className='texts'>
        <div className='logo'>
          <img src="/vlute.png" alt="" />
          <h1>WEB AI</h1>
        </div>
      </div>

      <div className='chat-container'>
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="message ai">AI đang suy nghĩ...</div>}
      </div>

      <div className='formContainer'>
        <NewPrompt 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
        />
      </div>
    </div>
  )
}

export default DashboardPage
