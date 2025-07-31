import React, { useEffect } from 'react'
import './dashboardLayout.css'
import { Outlet, useNavigate } from 'react-router-dom'
import ChatList from "../../components/chatList/ChatList"
const DashboardLayout = () => {

  // const {userId, isLoaded} = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem("token");

    if(!token) {
      //Nếu không có token thì điều hướng về trang đăng nhập
      navigate("/signInPage");
    }
  }, [navigate]); //chỉ chạy khi navigate thay đổi
  return (
    <div className='dashboardLayout'>
        <div className='menu'><ChatList/></div>
        <div className='content'>
            <Outlet/>
        </div>
    </div>
    
  )
}

export default DashboardLayout