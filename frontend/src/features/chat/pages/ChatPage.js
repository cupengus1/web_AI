import './ChatPage.css'
import { useEffect, useState, useCallback, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import NewPrompt from '../../../shared/components/newPrompt/NewPrompt';
import { publicChat } from '../../../shared/api/api'

const ChatPage = () => {
    const location = useLocation()
    const navigate = useNavigate()
    const initialQuestion = location.state?.initialQuestion
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const hasInitialized = useRef(false)
    const [chatId] = useState(() => `chat_${Date.now()}`)

    // Function để format câu trả lời của AI
    const formatAIResponse = (text) => {
        if (!text) return text

        // Tách text thành các câu dựa trên dấu chấm, chấm hỏi, chấm than
        const sentences = text.split(/(?<=[.!?])\s+/)
        
        // Loại bỏ các câu rỗng và format lại
        const formattedSentences = sentences
            .map(sentence => sentence.trim())
            .filter(sentence => sentence.length > 0)
            .map(sentence => {
                // Xử lý các từ được bold (**text**)
                return sentence.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            })

        return formattedSentences
    }

    // Function để lưu chat history
    const saveChatHistory = (title) => {
        const chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]')
        const newChat = {
            id: chatId,
            title: title,
            date: new Date().toLocaleDateString(),
            messages: messages
        }
        
        // Kiểm tra xem chat đã tồn tại chưa
        const existingIndex = chatHistory.findIndex(chat => chat.id === chatId)
        if (existingIndex >= 0) {
            chatHistory[existingIndex] = newChat
        } else {
            chatHistory.unshift(newChat) // Thêm vào đầu
        }
        
        localStorage.setItem('chatHistory', JSON.stringify(chatHistory))
    }

    const handleSendMessage = useCallback(async (question) => {
        if (!question.trim()) return

        console.log('🔄 handleSendMessage called with:', question)

        // Thêm câu hỏi của user vào messages
        const userMessage = { type: 'user', content: question }
        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            console.log('📡 Calling API with question:', question)
            const response = await publicChat(question)
            console.log('✅ API response received:', response.data)
            
            // Format câu trả lời của AI
            const formattedAnswer = formatAIResponse(response.data.answer)
            const aiMessage = { type: 'ai', content: formattedAnswer }
            setMessages(prev => [...prev, aiMessage])
            
            // Lưu chat history với title từ câu hỏi đầu tiên
            if (messages.length === 0) {
                const title = question.length > 30 ? question.substring(0, 30) + '...' : question
                saveChatHistory(title)
            } else {
                saveChatHistory(messages[0].content.length > 30 ? messages[0].content.substring(0, 30) + '...' : messages[0].content)
            }
        } catch (error) {
            console.error('❌ API Error:', error)
            const errorMessage = { type: 'error', content: 'Có lỗi xảy ra khi gọi AI. Vui lòng thử lại.' }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }, [messages, chatId])

    // Tự động gửi câu hỏi ban đầu nếu có (chỉ 1 lần)
    useEffect(() => {
        console.log('🔍 useEffect triggered:', { initialQuestion, hasInitialized: hasInitialized.current })
        if (initialQuestion && !hasInitialized.current) {
            console.log('🚀 Initializing with question:', initialQuestion)
            hasInitialized.current = true
            handleSendMessage(initialQuestion)
        }
    }, [initialQuestion, handleSendMessage])

    // Function để render AI message
    const renderAIMessage = (content) => {
        if (Array.isArray(content)) {
            return (
                <div className="ai-message-content">
                    {content.map((sentence, index) => (
                        <div key={index} className="ai-sentence" 
                             dangerouslySetInnerHTML={{ __html: sentence }}>
                        </div>
                    ))}
                </div>
            )
        }
        return <div>{content}</div>
    }

    return (
    <div className='chatPage'> 
        <div className='wrapper'>
            <div className='chat'>
                {messages.map((message, index) => (
                    <div key={index} className={`message ${message.type}`}>
                        {message.type === 'ai' ? renderAIMessage(message.content) : message.content}
                    </div>
                ))}
                
                {isLoading && (
                    <div className='message ai'>
                        AI đang suy nghĩ...
                    </div>
                )}
                
                <NewPrompt onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
        </div>
    </div>
    )
}

export default ChatPage
