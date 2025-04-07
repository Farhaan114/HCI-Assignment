import React from 'react';
import './ChatWindow.css';

const ChatWindow = ({ currentChat, loading, error, generateSummary, summary }) => {
  if (!currentChat) {
    return (
      <div className="chat-window empty">
        <div className="empty-state">
          <h2>Welcome to Chat Bot!</h2>
          <p>Start a new conversation or select an existing chat.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-window">
      <div className="messages">
        {currentChat.messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
            <div className="message-timestamp">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message system">
            <div className="loading-indicator">
              <span>●</span><span>●</span><span>●</span>
            </div>
          </div>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {currentChat.messages.length >= 2 && (
        <div className="summary-section">
          <button 
            onClick={generateSummary} 
            disabled={loading}
            className="summary-button"
          >
            Generate Summary
          </button>
          {summary && (
            <div className="summary-content">
              <h4>Chat Summary</h4>
              <p>{summary}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatWindow;