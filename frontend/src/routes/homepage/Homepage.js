import { Link } from 'react-router-dom'
import './homepage.css'

const Homepage = () => {
    return (
    <div className='homepage'>
        {/* <Link to="/dashboard">Dashboard</Link> */}
        <div className='left'>
            <h1>WEB AI</h1>
            <h2>Phát triển kỹ năng bản thân</h2>
            <h3>Hello word</h3>
            <Link to="/dashboard">Get Started </Link>
        </div>
        <div className='right'>
            <div className='imgContainer'>
                <div className='bgContainer'>
                    <div className='bg'></div>
                </div>
                <img src="/bot3.png" alt="" className="bot" />
            </div>
        </div>
    </div>
    )
}
export default Homepage