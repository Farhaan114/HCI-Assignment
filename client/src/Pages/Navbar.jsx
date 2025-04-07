import React from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import './Navbar.css';
import { FaRobot, FaTasks, FaChartLine, FaComments } from 'react-icons/fa';

const Navbar = () => {
  const navigate = useNavigate();
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg neon-navbar">
      <div className="container-fluid">
        <span className="navbar-brand neon-text">ProcesseX</span>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink to="/dashboard" className="nav-link neon-link">
                <FaChartLine /> Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/ai" className="nav-link neon-link">
                <FaRobot /> AI Assistant
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/tasks" className="nav-link neon-link">
                <FaTasks /> Tasks
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink to="/chats" className="nav-link neon-link">
                <FaComments /> Chats & Meetings
              </NavLink>
            </li>
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <span className="nav-link neon-username">{username}</span>
            </li>
            <li className="nav-item">
              <button className="btn neon-btn-logout" onClick={handleLogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 