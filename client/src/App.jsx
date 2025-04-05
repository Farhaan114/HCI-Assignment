import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './Pages/Login';
import Register from './Pages/Register';
import Navbar from './Pages/Navbar';
import Chats from './Pages/Chats';
import ChatDetail from './Pages/ChatDetail';
import './App.css'

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/chats" element={<Chats />} />
        <Route path="/chat/:userId" element={<ChatDetail />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App
