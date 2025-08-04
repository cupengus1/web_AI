import './chatList.css'
import { Link, useNavigate } from "react-router-dom"
import { useState, useEffect } from 'react'

const ChatList = () => {
  const navigate = useNavigate()
  const [chatHistory, setChatHistory] = useState([])

  // Lấy chat history từ localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem('chatHistory')
    if (savedChats) {
      setChatHistory(JSON.parse(savedChats))
    }
  }, [])

    const handleNewChat = () => {
        const newChatId = `chat_${Date.now()}`
        navigate(`/dashboard/chats/${newChatId}`)
    }

    const handleChatClick = (chatId) => {
        navigate(`/dashboard/chats/${chatId}`)
    }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('chatHistory')
    navigate('/')
  }

  return (
    <div className='chatList'>
        <div className='header'>
            <img src="/vlute.png" alt="" className='logo-chatList'/>
            <span className='title'>WEB AI</span>
        </div>
        
        <div className='section'>
            <span className='section-title'>DASHBOARD</span>
            <button className='new-chat-btn' onClick={handleNewChat}>
                Create a new chat
            </button>
            <Link to="/" className='nav-link'>Explore WEB AI</Link>
            <Link to="/" className='nav-link'>Contact</Link>
        </div>
        
        <hr/>
        
        <div className='section'>
            <span className='section-title'>RECENT CHATS</span>
            <div className='chat-history'>
                {chatHistory.length > 0 ? (
                    chatHistory.map((chat, index) => (
                        <div 
                            key={index} 
                            className='chat-item'
                            onClick={() => handleChatClick(chat.id)}
                        >
                            <span className='chat-title'>{chat.title}</span>
                            <span className='chat-date'>{chat.date}</span>
                        </div>
                    ))
                ) : (
                    <div className='no-chats'>
                        <span>No recent chats</span>
                        <span>Start a new conversation!</span>
                    </div>
                )}
            </div>
        </div>
        
        <hr/>
        
        <div className='upgrade'>
            <img src="/vlute.png" alt="" className='logo-chatList'/>
            <div className='texts'>
                <span>Upgrade to Web AI Pro</span>
                <span>Get unlimited access to all features</span>
            </div>
        </div>
        
        <div className='footer'>
            <button className='logout-btn' onClick={handleLogout}>
                Logout
            </button>
        </div>
    </div>
  )
}

export default ChatList