import './DashboardPage.css'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const DashboardPage = () => {
    const [question, setQuestion] = useState('')
    const navigate = useNavigate()

    const handleSubmit = (e) => {
        e.preventDefault()
        
        if (!question.trim()) {
            return
        }

        // Chuyển đến ChatPage với question
        navigate('/chat', { 
            state: { initialQuestion: question }
        })
    }

    const handleOptionClick = (optionText) => {
        setQuestion(optionText)
    }

    return (
    <div className='dashboardPage'>
        <div className='texts'>
            <div className='logo'>
                <img src="vlute.png" alt =""/>
                <h1>WEB AI</h1>
            </div>
            <div className='options'>
                <div className='option' onClick={() => handleOptionClick('Tạo một cuộc trò chuyện mới')}>
                    <span>Create a New Chat</span>
                </div>
                 <div className='option' onClick={() => handleOptionClick('Phân tích hình ảnh')}>
                    <span>Analyze Images</span>
                 </div>
                <div className='option' onClick={() => handleOptionClick('Giúp tôi với code của tôi')}>
                    <span>Help me with My code</span>
                </div> 
            </div>
        </div>
        <div className='formContainer'>
            <form onSubmit={handleSubmit}>
                <input 
                    type='text' 
                    placeholder='Ask me anything...' 
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                />
                <button type="submit">
                    <img src="arrow.png" alt=""/>
                </button>
            </form>
        </div>
    </div>
    )
}

export default DashboardPage
