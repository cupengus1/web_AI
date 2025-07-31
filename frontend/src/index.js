import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Homepage from './routes/homepage/Homepage';
import DashboardPage from './routes/dashboardPage/DashboardPage';
import ChatPage from './routes/chatPage/ChatPage';
import RootLayout from './layouts/rootLayout/RootLayout';
import DashboardLayout from './layouts/dashboarhLayout/DashboardLayout';
//import LoginForm from './components/login';
import SignUpPage from './routes/signUpPage/SignUpPage';
import SignInPage from './routes/signInPage/SignInPage';

const router = createBrowserRouter([
  {
    element: <RootLayout/>,
    children: [
      {
        path: "/",
        element: <Homepage/>,
      },
      // {
      //   path: "/login", 
      //   element: <LoginForm/>,
      // },
      {
        path: "/signUpPage",
        element: <SignUpPage/>,
      },
      {
        path: "/signInPage",
        element: <SignInPage/>,
      },
      {
        element: <DashboardLayout/>,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage/>,
          },
          {
            path: "/dashboard/chats/:id",
            element: <ChatPage/>,
          },
        ],
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

