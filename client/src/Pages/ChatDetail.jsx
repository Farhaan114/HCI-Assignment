import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessagesBetweenUsers } from '../Services/chatService';
import { getUserById } from '../Services/userService';
import { io } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaVideo, FaRegStar, FaStar, FaEllipsisV, FaPaperclip, FaMicrophone, FaRegSmile, FaSearch, FaBell } from 'react-icons/fa';
import { IoMdSend } from 'react-icons/io';

const ChatDetail = () => {
  const { userId } = useParams();
  const currentUserId = localStorage.getItem('userId');
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState('');
  const [oppositeUsername, setOppositeUsername] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('Disconnected');
  const [isCalling, setIsCalling] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [peerConnection, setPeerConnection] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const videoRefLocal = useRef(null);
  const videoRefRemote = useRef(null);
  const audioRefRemote = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socketInstance = io('https://f075-110-224-82-191.ngrok-free.app/');
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setConnectionStatus('Connected');
      socketInstance.emit('join-room', { userId1: currentUserId, userId2: userId });
      const roomId = [currentUserId, userId].sort().join('-');
      socketInstance.emit('join-room', roomId);
    });

    socketInstance.on('disconnect', () => {
      setConnectionStatus('Disconnected');
    });

    socketInstance.on('receive-message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socketInstance.on('incoming-call', ({ from }) => {
      console.log("Incoming call from", from);
      setIncomingCall(true);
    });
    
    socketInstance.on('offer', async (offer) => {
      const pc = createPeerConnection();
      setPeerConnection(pc);
    
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      videoRefLocal.current.srcObject = stream;
    
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
    
      socket.emit('answer', answer);
    });
    
    socketInstance.on('answer', async (answer) => {
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });
    
    socketInstance.on('ice-candidate', async (candidate) => {
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    return () => {
      socketInstance.disconnect();
      // Clean up video streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [currentUserId, userId]);

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection();
  
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('ice-candidate', event.candidate);
      }
    };
  
    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      if (audioRefRemote.current) {
        audioRefRemote.current.srcObject = remoteStream;
      }
    };
  
    return pc;
  };

  const handleJoinCall = async () => {
    const pc = createPeerConnection();
    setPeerConnection(pc);
  
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    stream.getTracks().forEach(track => pc.addTrack(track, stream));
    videoRefLocal.current.srcObject = stream;
  
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    socket.emit('offer', { offer, to: userId });
  };
  
  useEffect(() => {
    if (videoRefRemote.current && remoteStream) {
      videoRefRemote.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const messagesData = await getChatMessagesBetweenUsers(currentUserId, userId);
        setMessages(messagesData);
      } catch (err) {
        setError('No messages found between these users.');
      }
    };

    const fetchOppositeUsername = async () => {
      try {
        const userData = await getUserById(userId);
        setOppositeUsername(userData.username);
      } catch (err) {
        setError('Error fetching user information.');
      }
    };

    fetchMessages();
    fetchOppositeUsername();
  }, [currentUserId, userId]);

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const messageData = {
        senderId: currentUserId,
        receiverId: userId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      };
      
      // Add message locally
      setMessages((prevMessages) => [...prevMessages, messageData]);
      
      // Send through socket
      if (socket && connectionStatus === 'Connected') {
        socket.emit('send-message', messageData);
      }
      
      // Clear input
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStartCall = () => {
    setIsCalling(true);
    socket.emit('initiate-call', { to: userId, from: currentUserId });
    handleJoinCall();
  };

  const handleAcceptCall = () => {
    setIncomingCall(false);
    handleJoinCall();
  };

  const handleDeclineCall = () => {
    setIncomingCall(false);
    socket.emit('decline-call', { to: userId });
  };

  const handleEndCall = () => {
    setIsCalling(false);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    socket.emit('end-call', { to: userId });
  };

  const toggleStarred = () => {
    setIsStarred(!isStarred);
  };

  const togglePriority = () => {
    setIsPriority(!isPriority);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage(prevMessage => prevMessage + emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleSearch = () => {
    setIsSearching(!isSearching);
    if (!isSearching) {
      setSearchQuery('');
    }
  };

  const filterMessages = () => {
    if (!searchQuery.trim()) return messages;
    return messages.filter(message => 
      message.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const filteredMessages = filterMessages();

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-12 col-md-12 col-lg-12 h-100">
          <div className="card h-100">
            <div className="card-header bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${oppositeUsername}&background=random`} 
                    className="rounded-circle mr-2" 
                    alt={oppositeUsername}
                    width="40" 
                    height="40" 
                  />
                  <div className="ml-2">
                    <h5 className="mb-0">{oppositeUsername}</h5>
                    <small className="text-muted">{connectionStatus}</small>
                  </div>
                </div>
                <div className="d-flex">
                  <button className="btn btn-link text-dark" onClick={toggleSearch}>
                    <FaSearch />
                  </button>
                  <button className="btn btn-link text-dark" onClick={toggleStarred}>
                    {isStarred ? <FaStar /> : <FaRegStar />}
                  </button>
                  <button className="btn btn-link text-dark" onClick={handleStartCall}>
                    <FaVideo />
                  </button>
                  <button className="btn btn-link text-dark">
                    <FaEllipsisV />
                  </button>
                </div>
              </div>
              {isSearching && (
                <div className="mt-2">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search in conversation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              )}
            </div>
            
            <div 
              className="card-body overflow-auto" 
              style={{ height: 'calc(100% - 130px)' }}
              ref={chatContainerRef}
            >
              {error && <div className="alert alert-danger">{error}</div>}
              
              {filteredMessages.map((message, index) => (
                <div 
                  key={index} 
                  className={`d-flex ${message.senderId === currentUserId ? 'justify-content-end' : 'justify-content-start'} mb-3`}
                >
                  {message.senderId !== currentUserId && (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${oppositeUsername}&background=random`} 
                      className="rounded-circle mr-2 align-self-end" 
                      alt={oppositeUsername}
                      width="30" 
                      height="30" 
                    />
                  )}
                  <div 
                    className={`p-2 rounded ${
                      message.senderId === currentUserId 
                        ? 'bg-primary text-white' 
                        : 'bg-light'
                    }`}
                    style={{ maxWidth: '75%' }}
                  >
                    <p className="mb-0">{message.content}</p>
                    <small className={`${message.senderId === currentUserId ? 'text-white-50' : 'text-muted'}`}>
                      {formatTime(message.timestamp)}
                    </small>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="card-footer bg-light">
              <div className="input-group">
                <button className="btn btn-outline-secondary" onClick={toggleEmojiPicker}>
                  <FaRegSmile />
                </button>
                <button className="btn btn-outline-secondary">
                  <FaPaperclip />
                </button>
                <textarea 
                  className="form-control" 
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="1"
                />
                <button className="btn btn-outline-secondary">
                  <FaMicrophone />
                </button>
                <button 
                  className="btn btn-primary"
                  onClick={handleSendMessage}
                  disabled={newMessage.trim() === ''}
                >
                  <IoMdSend />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Video call modals */}
      {isCalling && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="card" style={{ width: '80%', maxWidth: '800px' }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Call with {oppositeUsername}</h5>
              <button className="btn btn-danger" onClick={handleEndCall}>End Call</button>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8">
                  <div className="bg-dark rounded" style={{ height: '400px' }}>
                    <video 
                      ref={videoRefRemote} 
                      autoPlay 
                      playsInline
                      className="w-100 h-100"
                    />
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="bg-dark rounded" style={{ height: '200px' }}>
                    <video 
                      ref={videoRefLocal} 
                      autoPlay 
                      playsInline 
                      muted
                      className="w-100 h-100"
                    />
                  </div>
                </div>
              </div>
              <audio ref={audioRefRemote} autoPlay />
            </div>
          </div>
        </div>
      )}
      
      {incomingCall && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="card" style={{ width: '300px' }}>
            <div className="card-header">
              <h5 className="mb-0">Incoming Call</h5>
            </div>
            <div className="card-body text-center">
              <p>{oppositeUsername} is calling you</p>
              <div className="d-flex justify-content-around">
                <button className="btn btn-success" onClick={handleAcceptCall}>Accept</button>
                <button className="btn btn-danger" onClick={handleDeclineCall}>Decline</button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showEmojiPicker && (
        <div className="position-absolute bottom-100 start-0 mb-2">
          {/* Emoji picker would go here - using a placeholder */}
          <div className="bg-white p-2 rounded shadow">
            <div className="d-flex flex-wrap" style={{ maxWidth: '200px' }}>
              {['😀', '😂', '🙂', '😍', '😎', '👍', '❤️', '😢', '🎉'].map(emoji => (
                <div 
                  key={emoji} 
                  className="p-1 cursor-pointer" 
                  onClick={() => handleEmojiSelect({ native: emoji })}
                  style={{ cursor: 'pointer' }}
                >
                  {emoji}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatDetail;