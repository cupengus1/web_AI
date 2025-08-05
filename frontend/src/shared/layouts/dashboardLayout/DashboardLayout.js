import React, { useEffect } from 'react'
import './dashboardLayout.css'
import { Outlet, useNavigate } from 'react-router-dom'
import ChatList from '../../components/chatList/ChatList'
import '../../../index.css'
const DashboardLayout = () => {
  const navigate = useNavigate()
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/signin");
    }
  }, [navigate]);

  return (
    <div className='dashboardLayout'>
      <div className='sidebar'>
        <ChatList />
      </div>
      <div className='main-content'>
        <Outlet />
      </div>
    </div>
  )
}

export default DashboardLayout
