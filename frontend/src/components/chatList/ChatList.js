import './chatList.css'
import {Link} from "react-router-dom"
const ChatList = () => {
  return (
    <div className='chatList'>
        <span className='title'>DASHBOARD</span>
        <Link to="/dashboard">Create a new chat</Link>
        <Link to="/">Explore WEB AI</Link>
        <Link to="/">Contact</Link>
        <hr/>
        <span className='title'>RENCENT CHATS</span>
        <div className='list'>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
            <Link to="/">My chat title</Link>
        </div>
        <hr/>
        <div className='upgrade'>
            <img src="/vlute.png" alt="" className='logo-chatList'/>
            <div className='texts'>
                <span>Upgrade to Web AI Pro</span>
                <span>Get unlimited access to all features</span>
            </div>
        </div>
    </div>
  )
}

export default ChatList