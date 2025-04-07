import React from 'react';
import './MessageInput.css';

const MessageInput = ({ prompt, setPrompt, onSubmit, loading, disabled }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      onSubmit();
    }} className="message-input">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your message here..."
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button 
        type="submit" 
        disabled={loading || !prompt.trim() || disabled}
      >
        <span>{loading ? 'Processing...' : 'Send'}</span>
      </button>
    </form>
  );
};

export default MessageInput;
