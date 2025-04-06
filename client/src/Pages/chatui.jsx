import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Chat = () => {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: 'John', 
      text: 'Hey there!', 
      time: '10:00 AM',
      status: 'delivered',
      avatar: 'JD'
    },
    { 
      id: 2, 
      sender: 'You', 
      text: 'Hi! How are you?', 
      time: '10:01 AM',
      status: 'read',
      avatar: 'ME'
    },
    { 
      id: 3, 
      sender: 'John', 
      text: 'I\'m good, thanks! Working on that project we discussed.', 
      time: '10:02 AM',
      status: 'delivered',
      avatar: 'JD'
    },
  ]);

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedUser, setSelectedUser] = useState({
    id: 1,
    name: 'John',
    status: 'online',
    lastMessage: 'I\'m good, thanks! Working on that project we discussed.',
    avatar: 'JD'
  });

  const [users] = useState([
    { 
      id: 1, 
      name: 'John', 
      status: 'online', 
      lastMessage: 'I\'m good, thanks! Working on that project we discussed.',
      avatar: 'JD' 
    },
    { 
      id: 2, 
      name: 'Sarah', 
      status: 'offline', 
      lastMessage: 'Can we meet tomorrow?',
      avatar: 'SA' 
    },
    { 
      id: 3, 
      name: 'Mike', 
      status: 'online', 
      lastMessage: 'The files are ready for review',
      avatar: 'MI' 
    },
    { 
      id: 4, 
      name: 'Emily', 
      status: 'online', 
      lastMessage: 'Thanks for the help!',
      avatar: 'EM' 
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: 'You',
        text: newMessage,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent',
        avatar: 'ME'
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Update last message in users list
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === selectedUser.id ? { ...user, lastMessage: newMessage } : user
      ));
      
      // Simulate message delivery and read status
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ));
      }, 1000);
      
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'read' } : msg
        ));
      }, 2000);
    }
  };

  const handleTyping = () => {
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    }
  };

  return (
    <div className="vh-100 vw-100 bg-dark d-flex">
      {/* Left Panel - Users List */}
      <div className="col-3 border-end border-neon">
        <div className="d-flex flex-column h-100">
          <div className="p-3 border-bottom border-neon">
            <h5 className="text-light mb-0">Chats</h5>
          </div>
          <div className="flex-grow-1 overflow-auto">
            {users.map((user) => (
              <div
                key={user.id}
                className={`p-3 border-bottom border-neon user-list-item ${
                  selectedUser.id === user.id ? 'bg-dark-selected' : ''
                }`}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedUser(user)}
              >
                <div className="d-flex align-items-center">
                  <div className="position-relative me-3">
                    <div 
                      className="rounded-circle bg-neon text-dark d-flex align-items-center justify-content-center"
                      style={{ width: '40px', height: '40px' }}
                    >
                      {user.avatar}
                    </div>
                    <div
                      className={`position-absolute bottom-0 end-0 rounded-circle border border-2 ${
                        user.status === 'online' ? 'bg-success' : 'bg-secondary'
                      }`}
                      style={{ width: '12px', height: '12px' }}
                    />
                  </div>
                  <div className="flex-grow-1">
                    <div className="text-light">{user.name}</div>
                    <div className="message-preview">
                      {user.lastMessage}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="col-9 d-flex flex-column">
        {/* Chat Header */}
        <div className="p-3 border-bottom border-neon">
          <div className="d-flex align-items-start justify-content-between">
            <div className="d-flex">
              <div className="position-relative me-3">
                <div 
                  className="rounded-circle bg-neon text-dark d-flex align-items-center justify-content-center"
                  style={{ width: '40px', height: '40px' }}
                >
                  {selectedUser.avatar}
                </div>
                <div
                  className={`position-absolute bottom-0 end-0 rounded-circle border border-2 ${
                    selectedUser.status === 'online' ? 'bg-success' : 'bg-secondary'
                  }`}
                  style={{ width: '12px', height: '12px' }}
                />
              </div>
              <div>
                <h5 className="text-light mb-1">{selectedUser.name}</h5>
                <div className="d-flex align-items-center text-muted" style={{ fontSize: '0.85rem' }}>
                  <span className="me-2">
                    <i className="bi bi-geo-alt me-1"></i>
                    New York, USA
                  </span>
                  <span className="me-2">•</span>
                  <span className="me-2">
                    <i className="bi bi-clock me-1"></i>
                    Local time 10:30 AM
                  </span>
                  <span className="me-2">•</span>
                  <span>
                    <i className="bi bi-calendar3 me-1"></i>
                    Member since Jan 2024
                  </span>
                </div>
              </div>
            </div>
            <button 
              className="btn btn-sm btn-neon"
              onClick={() => navigate('/')}
              style={{ minWidth: '80px' }}
            >
              <i className="bi bi-camera-video me-1"></i>
              Meet
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-grow-1 overflow-auto p-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-3 ${message.sender === 'You' ? 'text-end' : ''}`}
            >
              <div className="d-flex align-items-end" style={{ flexDirection: message.sender === 'You' ? 'row-reverse' : 'row' }}>
                {message.sender !== 'You' && (
                  <div 
                    className="rounded-circle bg-neon text-dark d-flex align-items-center justify-content-center me-2"
                    style={{ width: '32px', height: '32px' }}
                  >
                    {message.avatar}
                  </div>
                )}
                <div>
                  <div
                    className={`d-inline-block p-2 rounded ${
                      message.sender === 'You'
                        ? 'bg-neon text-dark'
                        : 'bg-dark text-light border border-neon'
                    }`}
                    style={{ maxWidth: '70%' }}
                  >
                    {message.sender !== 'You' && (
                      <div className="fw-bold mb-1">{message.sender}</div>
                    )}
                    <div>{message.text}</div>
                    <div className="d-flex align-items-center justify-content-end mt-1">
                      <small className="text-muted me-1">{message.time}</small>
                      {message.sender === 'You' && (
                        <i className={`bi bi-${
                          message.status === 'read' ? 'check2-all' : 
                          message.status === 'delivered' ? 'check2' : 
                          'clock'
                        }`}></i>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="mb-3">
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle bg-neon text-dark d-flex align-items-center justify-content-center me-2"
                  style={{ width: '32px', height: '32px' }}
                >
                  {selectedUser.avatar}
                </div>
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-3 border-top border-neon">
          <form onSubmit={handleSendMessage}>
            <div className="input-group">
              <input
                type="text"
                className="form-control bg-dark text-light border-neon"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  handleTyping();
                }}
              />
              <button
                className="btn btn-neon"
                type="submit"
                disabled={!newMessage.trim()}
              >
                <i className="bi bi-send"></i>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
