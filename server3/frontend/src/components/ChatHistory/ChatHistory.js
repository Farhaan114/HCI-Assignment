import React from 'react';
import './ChatHistory.css';

const ChatHistory = ({ 
  chats, 
  activeChat, 
  onSelectChat, 
  onDeleteChat, 
  sentimentAnalysis 
}) => {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (chats.length === 0) {
    return (
      <div className="chat-history empty">
        <p>No conversations yet</p>
        <p className="hint">Start a new chat to begin!</p>
      </div>
    );
  }

  return (
    <div className="chat-history">
      {chats.map((chat) => (
        <div
          key={chat.id}
          className={`chat-item ${activeChat?.id === chat.id ? 'active' : ''}`}
          onClick={() => onSelectChat(chat)}
        >
          <div className="chat-item-header">
            <h3 className="chat-title">{chat.title || 'New Chat'}</h3>
            <button
              className="delete-btn"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteChat(chat.id);
              }}
              title="Delete chat"
            >
              ×
            </button>
          </div>
          
          <div className="chat-info">
            <span className="timestamp">{formatDate(chat.timestamp)}</span>
            {sentimentAnalysis[chat.id] && (
              <span className={`sentiment ${sentimentAnalysis[chat.id].label}`}>
                {sentimentAnalysis[chat.id].label}
              </span>
            )}
          </div>
          
          <div className="chat-preview">
            {chat.messages.length > 0 
              ? chat.messages[chat.messages.length - 1].content.substring(0, 60) + '...'
              : 'No messages yet'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatHistory;