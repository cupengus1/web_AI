import { Link } from 'react-router-dom'
import './Homepage.css'

const Homepage = () => {
    return (
    <div className='homepage'>
        {/* <Link to="/dashboard">Dashboard</Link> */}
        <div className='left'>
            <h1>WEB AI</h1>
            <h2>Phát triển kỹ năng bản thân</h2>
            <h3>Hello word</h3>
            <div className='homepage-buttons'>
                <Link to="/signup" className='get-started-btn'>Đăng ký</Link>
                <Link to="/signin" className='login-btn'>Đăng nhập</Link>
            </div>
        </div>
        <div className='right'>
            <div className='imgContainer'>
                <div className='bgContainer'>
                    <div className='bg'></div>
                </div>
                <img src="/bot4.png" alt="" className="bot" />
            </div>
        </div>
    </div>
    )
}
export default Homepage
