import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./sidebar.css";

const Sidebar = () => {
  const [chatHistory, setChatHistory] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedChats = JSON.parse(localStorage.getItem("chatHistory") || "[]");
    setChatHistory(storedChats);
  }, [location.pathname]); // reload khi đổi route

  const handleSelectChat = (chatId) => {
    navigate(`/dashboard/chat/${chatId}`);
  };

  const handleNewChat = () => {
    navigate("/dashboard"); // quay lại dashboard chính
  };

  return (
    <div className="sidebarChat">
      <div className="sidebarHeader">
        <h2>Chats</h2>
        <button onClick={handleNewChat}>+ New Chat</button>
      </div>
      <div className="chatList">
        {chatHistory.length === 0 ? (
          <p>No chats yet</p>
        ) : (
          chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="chatItem"
              onClick={() => handleSelectChat(chat.id)}
            >
              <h4>{chat.title}</h4>
              <span>{chat.date}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
