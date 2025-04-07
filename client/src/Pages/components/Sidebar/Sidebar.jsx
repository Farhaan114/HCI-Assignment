import React from 'react';
import './Sidebar.css';

const Sidebar = ({
  isVisible,
  chatHistory,
  activeChatId,
  selectChat,
  createNewChat,
  deleteChat,
  sentimentAnalysis
}) => {
  return (
    <aside className={`sidebar ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="sidebar-header">
        <h2>Chat History</h2>
        <button onClick={createNewChat} className="new-chat-btn">
          New Chat
        </button>
      </div>

      <div className="chat-list">
        {chatHistory.length === 0 ? (
          <div className="empty-history">
            No chat history yet. Start a new conversation!
          </div>
        ) : (
          chatHistory.map(chat => (
            <div 
              key={chat.id} 
              className={`chat-item ${chat.id === activeChatId ? 'active' : ''}`}
            >
              <div 
                className="chat-title" 
                onClick={() => selectChat(chat.id)}
              >
                {chat.title}
                <span className="chat-timestamp">
                  {new Date(chat.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              {sentimentAnalysis[chat.id] && (
                <div className={`sentiment-indicator ${sentimentAnalysis[chat.id].label}`}>
                  {sentimentAnalysis[chat.id].label}
                </div>
              )}
              
              <button 
                className="delete-chat-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Are you sure you want to delete this chat?')) {
                    deleteChat(chat.id);
                  }
                }}
                title="Delete chat"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
};

export default Sidebar;