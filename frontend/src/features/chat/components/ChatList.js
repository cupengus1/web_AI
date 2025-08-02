import './ChatList.css';
import { Link } from "react-router-dom";
import { useState, useEffect } from 'react';
import { getConversations, getProcedures } from '../../../api/api';

const ProcedureSidebar = () => {
    const [conversations, setConversations] = useState([]);
    const [procedures, setProcedures] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [conversationsRes, proceduresRes] = await Promise.all([
                getConversations(),
                getProcedures()
            ]);
            setConversations(conversationsRes.data.conversations || []);
            setProcedures(proceduresRes.data.procedures || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='procedureSidebar'>
            <div className='sidebar-header'>
                <h2>🏢 Quy trình nội bộ</h2>
            </div>
            
            <div className='navigation-section'>
                <span className='section-title'>ĐIỀU HƯỚNG</span>
                <Link to="/dashboard" className='nav-link'>
                    🏠 Trang chủ
                </Link>
                <Link to="/procedures" className='nav-link'>
                    📋 Danh sách quy trình
                </Link>
                <Link to="/chat" className='nav-link'>
                    💬 Hỏi AI về quy trình
                </Link>
                <Link to="/help" className='nav-link'>
                    ❓ Hướng dẫn sử dụng
                </Link>
                <hr/>
            </div>
            
            <div className='procedures-section'>
                <span className='section-title'>QUY TRÌNH PHỔ BIẾN</span>
                <div className='procedures-list'>
                    {loading ? (
                        <div className='loading'>Đang tải quy trình...</div>
                    ) : procedures.length > 0 ? (
                        procedures.slice(0, 5).map((procedure) => (
                            <Link key={procedure._id} to={`/procedures/${procedure._id}`} className='procedure-item'>
                                📄 {procedure.title}
                            </Link>
                        ))
                    ) : (
                        <div className='no-procedures'>Chưa có quy trình nào</div>
                    )}
                </div>
                <hr/>
            </div>
            
            <div className='recent-chats-section'>
                <span className='section-title'>CÂU HỎI GẦN ĐÂY</span>
                <div className='chats-list'>
                    {loading ? (
                        <div className='loading'>Đang tải cuộc trò chuyện...</div>
                    ) : conversations.length > 0 ? (
                        conversations.slice(0, 3).map((conv) => (
                            <Link key={conv._id} to={`/chat/${conv._id}`} className='chat-item'>
                                💬 {conv.title}
                            </Link>
                        ))
                    ) : (
                        <div className='no-chats'>Chưa có cuộc trò chuyện nào</div>
                    )}
                </div>
                <hr/>
            </div>
            
            <div className='support-section'>
                <div className='support-card'>
                    <img src="/vlute.png" alt="Support Logo" className='support-logo'/>
                    <div className='support-content'>
                        <h4>Cần hỗ trợ?</h4>
                        <p>Liên hệ bộ phận IT để được giúp đỡ</p>
                        <Link to="/contact" className='support-link'>
                            Liên hệ IT Support
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcedureSidebar;
