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
  const socketRef = useRef(null); // New ref to keep socket instance consistent

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socketInstance = io('https://2fd1-182-74-172-122.ngrok-free.app', {
      extraHeaders: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    // Save socket to state and ref
    setSocket(socketInstance);
    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      setConnectionStatus('Connected');
      // Join room with both formats to ensure compatibility
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
      console.log("Received offer:", offer);
      const pc = createPeerConnection();
      setPeerConnection(pc);
    
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        
        // Make sure videoRefLocal.current exists before setting srcObject
        if (videoRefLocal.current) {
          videoRefLocal.current.srcObject = stream;
        }
        
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
      
        socketRef.current.emit('answer', answer);
      } catch (err) {
        console.error("Error handling offer:", err);
        setError("Failed to setup media connection. Please check camera/mic permissions.");
      }
    });
    
    socketInstance.on('answer', async (answer) => {
      console.log("Received answer:", answer);
      if (peerConnection) {
        try {
          await peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    });
    
    socketInstance.on('ice-candidate', async (candidate) => {
      console.log("Received ICE candidate:", candidate);
      if (peerConnection) {
        try {
          await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
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
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add more STUN/TURN servers for better connectivity
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });
  
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("Sending ICE candidate:", event.candidate);
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };
  
    // Enhanced ontrack handler with better logging
    pc.ontrack = (event) => {
      console.log("Got remote track:", event.streams[0]);
      
      // Save remote stream to state
      setRemoteStream(event.streams[0]);
      
      // Directly set the srcObject on the video element if ref exists
      if (videoRefRemote.current) {
        console.log("Setting remote video source");
        videoRefRemote.current.srcObject = event.streams[0];
      } else {
        console.warn("Remote video ref not available yet");
      }
    };
  
    // Add connection state change logging
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };
    
    // Add ICE connection state change logging
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
    };
  
    return pc;
  };
  useEffect(() => {
    if (videoRefRemote.current && remoteStream) {
      console.log("Setting remote video from effect");
      videoRefRemote.current.srcObject = remoteStream;
      // Ensure video plays automatically
      videoRefRemote.current.play().catch(err => console.error("Play error:", err));
    }
  }, [remoteStream, videoRefRemote.current]);

  const handleJoinCall = async () => {
    try {
      const pc = createPeerConnection();
      setPeerConnection(pc);
    
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      // Check if ref exists before setting srcObject
      if (videoRefLocal.current) {
        videoRefLocal.current.srcObject = stream;
      }
      
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
    
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Use the socketRef to ensure we have a valid socket
      if (socketRef.current) {
        console.log("Sending offer");
        socketRef.current.emit('offer', offer);
      } else {
        console.error("Socket not available when trying to send offer");
      }
    } catch (err) {
      console.error("Error in handleJoinCall:", err);
      setError("Failed to setup media connection. Please check camera/mic permissions.");
    }
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
      
            
      // Send through socket
      if (socketRef.current && connectionStatus === 'Connected') {
        socketRef.current.emit('send-message', messageData);
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
    if (socketRef.current) {
      socketRef.current.emit('start-video-call', { userId1: currentUserId, userId2: userId });
      handleJoinCall();
    } else {
      setError("Connection error. Please refresh the page and try again.");
    }
  };

  const handleAcceptCall = () => {
    setIncomingCall(false);
    setIsCalling(true);
    handleJoinCall();
  };

  const handleDeclineCall = () => {
    setIncomingCall(false);
    if (socketRef.current) {
      socketRef.current.emit('decline-call', { to: userId });
    }
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
    if (socketRef.current) {
      socketRef.current.emit('end-call', { to: userId });
    }
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
  // Add this function to help debug connection issues
const checkConnectionStatus = () => {
  if (peerConnection) {
    console.log({
      iceConnectionState: peerConnection.iceConnectionState,
      connectionState: peerConnection.connectionState,
      signalingState: peerConnection.signalingState,
      remoteStreams: peerConnection.getReceivers().map(r => r.track.kind)
    });
    
    // Call this when accepting/starting a call
    setTimeout(checkConnectionStatus, 3000); // Check every 3 seconds
  }
};

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
        <div className="col-12 col-md-12 col-lg-12 h-100">
          <div className="card h-100">
            <div className="card-header bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                {incomingCall && (
                    <div className="incoming-call-popup p-3 bg-light border rounded">
                      <p>{oppositeUsername} is calling...</p>
                      <button className="btn btn-success mr-2" onClick={handleAcceptCall}>Accept</button>
                      <button className="btn btn-danger" onClick={handleDeclineCall}>Decline</button>
                    </div>
                  )}

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
              <div className="video-call-section mt-2">
              <div className="video-container d-flex justify-content-center gap-3">
                <div style={{ position: 'relative', width: '45%' }}>
                  <video
                    ref={videoRefLocal}
                    autoPlay
                    muted
                    playsInline
                    className="w-100"
                    style={{ borderRadius: '10px', border: '1px solid #ccc' }}
                  />
                  <span className="position-absolute bottom-0 left-0 bg-dark text-white p-1 rounded m-2">You</span>
                </div>
                <div style={{ position: 'relative', width: '45%' }}>
                  <video
                    ref={videoRefRemote}
                    autoPlay
                    playsInline
                    className="w-100"
                    style={{ borderRadius: '10px', border: '1px solid #ccc' }}
                  />
                  <span className="position-absolute bottom-0 left-0 bg-dark text-white p-1 rounded m-2">{oppositeUsername}</span>
                </div>
              </div>
              </div>
              <audio ref={audioRefRemote} autoPlay />
            </div>
          </div>
        </div>
      )}
      
      {incomingCall && !isCalling && (
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