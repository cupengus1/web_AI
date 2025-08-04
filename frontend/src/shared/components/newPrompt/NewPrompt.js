import { useEffect, useRef, useState } from 'react';
import './newPrompt.css'

const NewPrompt = ({ onSendMessage, isLoading = false }) => {
    const endRef = useRef(null);
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth"});
    }, [message, isLoading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!message.trim() || isLoading) {
            return;
        }

        onSendMessage(message);
        setMessage('');
    };

    return (
    <>
    <div className='endChat' ref={endRef}></div>
        <form className='newForm' onSubmit={handleSubmit}>
            <label htmlFor='file'>
                <img src="/attachment2.png" alt=""/>
            </label>
            <input id="file" type='file' multiple={false} hidden/>
            <input 
                type="text" 
                placeholder='Ask anything...' 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
                <img src="/up-arrow.png" alt=""/>
            </button>
        </form>
    </>
  )
}

export default NewPrompt