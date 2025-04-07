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
    <form onSubmit={onSubmit} className="message-input">
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
        {loading ? 'Processing...' : 'Send'}
      </button>
    </form>
  );
};

export default MessageInput;
