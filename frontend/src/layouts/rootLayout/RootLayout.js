import { Link, Outlet } from 'react-router-dom'
import './rootLayout.css'
import { useState } from 'react'

const RootLayout = () => {
    const [showMenu, setShowMenu] = useState(false);
    return (
    <div className='rootLayout'> 
        <header>
            <Link to="/" className='logo'>
                <img src="/vlute.png" alt=""/>
                <span>Web-AI</span>
            </Link>
            <div className='user' onclick={() => setShowMenu(!showMenu)}>
            
                <div className='dropdown'>
                    <Link to="/signInPage">Đăng nhập</Link>
                </div>
            </div>
        </header>
        <main>
            <Outlet/>
        </main>
    </div>
    )
}
export default RootLayout
