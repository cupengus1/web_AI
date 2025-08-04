import React, { useEffect } from 'react'
import './dashboardLayout.css'
import { Outlet, useNavigate } from 'react-router-dom'
import ChatList from '../../components/chatList/ChatList'
import Sidebar from "../shared/components/sidebar/Sidebar";

const DashboardLayout = () => {
  // const {userId, isLoaded} = useAuth()
  const navigate = useNavigate()
  
  useEffect(() => {
    const token = localStorage.getItem("token");
    if(!token) {
      //Nếu không có token thì điều hướng về trang đăng nhập
      navigate("/signin");
    }
  }, [navigate]); //chỉ chạy khi navigate thay đổi
  
  return (
    <div className='dashboardLayout'>
        <div className='sidebar'>
            <ChatList />
          
        </div>
        <div className='main-content'>
            <Outlet/>
        </div>
    </div>
  )
}

export default DashboardLayout
