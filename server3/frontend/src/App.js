import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import ChatWindow from '../../../client/src/Pages/components/ChatWindow/ChatWindow';
import ChatHistory from '../../../client/src/Pages/components/ChatHistory/ChatHistory';
import MessageInput from '../../../client/src/Pages/components/MessageInput/MessageInput';

function App() {
  const [model, setModel] = useState('llama2');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [backendStatus, setBackendStatus] = useState('checking');
  const [availableModels, setAvailableModels] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [sentimentAnalysis, setSentimentAnalysis] = useState({});
  const [summaries, setSummaries] = useState({});

  // Check backend status and load models
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await fetch('http://localhost:8000/health');
        if (res.ok) {
          setBackendStatus('connected');
          try {
            const modelRes = await fetch('http://localhost:8000/api/models');
            if (modelRes.ok) {
              const data = await modelRes.json();
              if (data.models && data.models.length > 0) {
                setAvailableModels(data.models);
              } else {
                setDefaultModels();
              }
            } else {
              setDefaultModels();
            }
          } catch (err) {
            setDefaultModels();
          }
        } else {
          setBackendStatus('disconnected');
          setDefaultModels();
        }
      } catch (err) {
        setBackendStatus('disconnected');
        setDefaultModels();
      }
    };
    
    checkBackend();
    loadStoredData();
  }, []);

  // Load stored data from localStorage
  const loadStoredData = () => {
    const savedHistory = localStorage.getItem('chatHistory');
    const savedSentiment = localStorage.getItem('sentimentAnalysis');
    const savedSummaries = localStorage.getItem('summaries');
    
    if (savedHistory) setChatHistory(JSON.parse(savedHistory));
    if (savedSentiment) setSentimentAnalysis(JSON.parse(savedSentiment));
    if (savedSummaries) setSummaries(JSON.parse(savedSummaries));
  };

  // Save data to localStorage when it changes
  useEffect(() => {
    if (chatHistory.length > 0) {
      localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    }
    if (Object.keys(sentimentAnalysis).length > 0) {
      localStorage.setItem('sentimentAnalysis', JSON.stringify(sentimentAnalysis));
    }
    if (Object.keys(summaries).length > 0) {
      localStorage.setItem('summaries', JSON.stringify(summaries));
    }
  }, [chatHistory, sentimentAnalysis, summaries]);

  const setDefaultModels = () => {
    setAvailableModels([
      { id: 'llama2', name: 'Llama 2' },
      { id: 'mistral', name: 'Mistral' },
      { id: 'gemma', name: 'Gemma' },
      { id: 'phi', name: 'Phi-2' },
      { id: 'codellama', name: 'Code Llama' }
    ]);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError('');
    
    let currentChatId = activeChatId;
    if (!currentChatId) {
      currentChatId = Date.now().toString();
      const newChat = {
        id: currentChatId,
        title: prompt.split(' ').slice(0, 3).join(' ') + '...',
        timestamp: new Date().toISOString(),
        messages: []
      };
      setChatHistory(prev => [newChat, ...prev]);
      setActiveChatId(currentChatId);
    }

    const userMessage = {
      role: 'user',
      content: prompt,
      timestamp: new Date().toISOString()
    };

    setChatHistory(prev => 
      prev.map(chat => 
        chat.id === currentChatId 
          ? { ...chat, messages: [...chat.messages, userMessage] }
          : chat
      )
    );

    try {
      const res = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, prompt })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Something went wrong');

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date().toISOString()
      };

      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === currentChatId 
            ? { ...chat, messages: [...chat.messages, assistantMessage] }
            : chat
        )
      );

      analyzeSentiment(currentChatId, data.response);
      setPrompt('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const analyzeSentiment = (chatId, text) => {
    const sentimentScore = Math.random() * 2 - 1;
    const sentiment = sentimentScore > 0.3 ? 'positive' : 
                     sentimentScore < -0.3 ? 'negative' : 'neutral';
    
    setSentimentAnalysis(prev => ({
      ...prev,
      [chatId]: { score: sentimentScore, label: sentiment }
    }));
  };

  const generateSummary = async () => {
    if (!activeChatId) return;
    
    const chat = chatHistory.find(c => c.id === activeChatId);
    if (!chat || chat.messages.length < 2) return;
    
    setLoading(true);
    try {
      const conversationText = chat.messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n\n');
      
      const res = await fetch('http://localhost:8000/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          prompt: `Summarize this conversation:\n\n${conversationText}`
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to generate summary');
      
      setSummaries(prev => ({ ...prev, [activeChatId]: data.response }));
    } catch (err) {
      setError('Failed to generate summary: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentChat = useCallback(() => {
    return chatHistory.find(chat => chat.id === activeChatId) || null;
  }, [chatHistory, activeChatId]);

  const createNewChat = () => {
    setActiveChatId(null);
    setPrompt('');
    setError('');
  };

  const deleteChat = (chatId) => {
    if (window.confirm('Are you sure you want to delete this chat?')) {
      setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
        setPrompt('');
      }
    }
  };

  return (
    <div className="app">
      <div className="app-container">
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1>Chat Bot</h1>
            <button onClick={createNewChat} className="new-chat-btn">
              New Chat
            </button>
          </div>
          <ChatHistory
            chats={chatHistory}
            activeChat={getCurrentChat()}
            onSelectChat={(chat) => setActiveChatId(chat.id)}
            onDeleteChat={deleteChat}
            sentimentAnalysis={sentimentAnalysis}
          />
        </aside>

        <main className="main-content">
          <div className="top-bar">
            <div className="model-selector">
              <label htmlFor="model">Model:</label>
              <select 
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
              >
                {availableModels.map(model => (
                  <option key={model.id} value={model.id}>{model.name}</option>
                ))}
              </select>
            </div>
            <div className={`status-indicator ${backendStatus}`}>
              {backendStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </div>
          </div>

          {backendStatus === 'disconnected' && (
            <div className="error-banner">
              Cannot connect to the backend server. Make sure it's running on http://localhost:8000
            </div>
          )}

          <ChatWindow
            currentChat={getCurrentChat()}
            loading={loading}
            error={error}
            generateSummary={generateSummary}
            summary={activeChatId ? summaries[activeChatId] : null}
          />

          <MessageInput
            prompt={prompt}
            setPrompt={setPrompt}
            onSubmit={handleSubmit}
            loading={loading}
            disabled={backendStatus !== 'connected'}
          />
        </main>
      </div>
    </div>
  );
}

export default App;