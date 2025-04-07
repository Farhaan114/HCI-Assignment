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
  const [isCallInitiator, setIsCallInitiator] = useState(false);
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);

  const videoRefLocal = useRef(null);
  const videoRefRemote = useRef(null);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const socketRef = useRef(null);
  const peerConnectionRef = useRef(null);

  useEffect(() => {
    // Scroll to bottom of messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socketInstance = io('https://c566-2401-4900-884c-38f1-6c14-ba36-ec54-f82f.ngrok-free.app', {
      extraHeaders: {
        'ngrok-skip-browser-warning': 'true'
      }
    });
    
    // Save socket to state and ref
    setSocket(socketInstance);
    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setConnectionStatus('Connected');
      // Join room with both formats to ensure compatibility
      socketInstance.emit('join-room', { userId1: currentUserId, userId2: userId });
      const roomId = [currentUserId, userId].sort().join('-');
      socketInstance.emit('join-room', roomId);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnectionStatus('Disconnected');
    });

    socketInstance.on('receive-message', (message) => {
      console.log('Received message:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });
    
    socketInstance.on('incoming-call', ({ from }) => {
      console.log("Incoming call from", from);
      setIncomingCall(true);
      setIsCallInitiator(false);
    });
    
    socketInstance.on('offer', async (offer) => {
      console.log("Received offer:", offer);
      
      try {
        // Create peer connection if not already created
        if (!peerConnectionRef.current) {
          const pc = createPeerConnection();
          peerConnectionRef.current = pc;
          setPeerConnection(pc);
        }
        
        // Set remote description from the offer
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        
        // If we don't have local stream yet, get it
        if (!localStream) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          setLocalStream(stream);
          
          // Add tracks to peer connection
          stream.getTracks().forEach(track => peerConnectionRef.current.addTrack(track, stream));
          
          // Set local video
          if (videoRefLocal.current) {
            videoRefLocal.current.srcObject = stream;
          }
        }
        
        // Create answer
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        // Send answer
        socketRef.current.emit('answer', answer);
      } catch (err) {
        console.error("Error handling offer:", err);
        setError("Failed to setup media connection. Please check camera/mic permissions.");
      }
    });
    
    socketInstance.on('answer', async (answer) => {
      console.log("Received answer:", answer);
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("Remote description set successfully");
        } catch (err) {
          console.error("Error setting remote description:", err);
        }
      }
    });
    
    socketInstance.on('ice-candidate', async (candidate) => {
      console.log("Received ICE candidate:", candidate);
      if (peerConnectionRef.current) {
        try {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          console.log("ICE candidate added successfully");
        } catch (err) {
          console.error("Error adding ICE candidate:", err);
        }
      } else {
        console.warn("Received ICE candidate but peer connection not ready");
      }
    });
    
    socketInstance.on('end-call', () => {
      console.log("Call ended by remote peer");
      handleEndCall();
    });

    return () => {
      socketInstance.disconnect();
      // Clean up video streams
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
        peerConnectionRef.current = null;
      }
    };
  }, [currentUserId, userId]);

  const createPeerConnection = () => {
    console.log("Creating peer connection");
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' }
      ]
    });
  
    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        console.log("Sending ICE candidate:", event.candidate);
        socketRef.current.emit('ice-candidate', event.candidate);
      }
    };
  
    pc.ontrack = (event) => {
      console.log("Got remote track:", event.streams[0]);
      
      // Save remote stream to state
      setRemoteStream(event.streams[0]);
      
      // Set the remote video source
      if (videoRefRemote.current) {
        console.log("Setting remote video source directly from ontrack");
        videoRefRemote.current.srcObject = event.streams[0];
      }
    };
  
    pc.onconnectionstatechange = () => {
      console.log("Connection state:", pc.connectionState);
    };
    
    pc.oniceconnectionstatechange = () => {
      console.log("ICE connection state:", pc.iceConnectionState);
      
      // If the connection is failed or disconnected, try to restart it
      if (pc.iceConnectionState === 'failed' || pc.iceConnectionState === 'disconnected') {
        console.log("Attempting to restart ICE");
        pc.restartIce();
      }
    };
  
    return pc;
  };

  useEffect(() => {
    // Set local video when localStream changes
    if (videoRefLocal.current && localStream) {
      videoRefLocal.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    // Set remote video when remoteStream changes
    if (videoRefRemote.current && remoteStream) {
      console.log("Setting remote video from remoteStream effect");
      videoRefRemote.current.srcObject = remoteStream;
      
      // Properly handle the play Promise
      const playPromise = videoRefRemote.current.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Remote video playing successfully");
            // Video is playing, no action needed
          })
          .catch(err => {
            console.warn("Auto-play failed:", err);
            // Show UI indicator that user needs to interact
            setNeedsUserInteraction(true);
          });
      }
    }
  }, [remoteStream]);

  const handleStartCall = async () => {
    try {
      console.log("Starting call");
      setIsCalling(true);
      setIsCallInitiator(true);
      
      // Create peer connection
      const pc = createPeerConnection();
      peerConnectionRef.current = pc;
      setPeerConnection(pc);
      
      // Get local stream
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      // Add tracks to peer connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));
      
      // Start the calling process
      socketRef.current.emit('start-video-call', { userId1: currentUserId, userId2: userId });
      
      // Create offer
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      // Send offer
      socketRef.current.emit('offer', offer);
      
      // Debug connection status
      setTimeout(checkConnectionStatus, 1000);
    } catch (err) {
      console.error("Error starting call:", err);
      setError("Failed to start call. Please check camera/mic permissions.");
      setIsCalling(false);
    }
  };

  const handleAcceptCall = async () => {
    try {
      console.log("Accepting call");
      setIncomingCall(false);
      setIsCalling(true);
      setIsCallInitiator(false);
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      
      // Peer connection will be created when offer is received
      // We just notify the other user that we've accepted
      socketRef.current.emit('accept-call', { from: currentUserId, to: userId });
      
      // Debug connection status
      setTimeout(checkConnectionStatus, 1000);
    } catch (err) {
      console.error("Error accepting call:", err);
      setError("Failed to accept call. Please check camera/mic permissions.");
    }
  };

  const handleDeclineCall = () => {
    setIncomingCall(false);
    if (socketRef.current) {
      socketRef.current.emit('decline-call', { to: userId });
    }
  };

  const handleEndCall = () => {
    console.log("Ending call");
    setIsCalling(false);
    
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    // Reset video elements
    if (videoRefLocal.current) {
      videoRefLocal.current.srcObject = null;
    }
    if (videoRefRemote.current) {
      videoRefRemote.current.srcObject = null;
    }
    
    // Notify other user
    if (socketRef.current) {
      socketRef.current.emit('end-call', { to: userId });
    }
  };

  const checkConnectionStatus = () => {
    if (peerConnectionRef.current) {
      console.log("Connection status check:", {
        iceConnectionState: peerConnectionRef.current.iceConnectionState,
        connectionState: peerConnectionRef.current.connectionState,
        signalingState: peerConnectionRef.current.signalingState,
        hasRemoteDescription: !!peerConnectionRef.current.remoteDescription,
        remoteStream: remoteStream ? "exists" : "null"
      });
      
      // Continue checking while in call
      if (isCalling) {
        setTimeout(checkConnectionStatus, 3000);
      }
    }
  };

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
        
        // Add to local messages list
        setMessages((prevMessages) => [...prevMessages, messageData]);
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
      
      {/* Video call modal */}
      {isCalling && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
          <div className="card" style={{ width: '80%', maxWidth: '800px' }}>
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Call with {oppositeUsername}</h5>
              <button className="btn btn-danger" onClick={handleEndCall}>End Call</button>
            </div>
            <div className="card-body p-3">
              <div className="video-call-section">
                <div className="video-container d-flex justify-content-center gap-3">
                  <div style={{ position: 'relative', width: '45%' }}>
                    <video
                      ref={videoRefLocal}
                      autoPlay
                      playsInline
                      className="w-100 h-auto"
                      style={{ borderRadius: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}
                    />
                    <p className="position-absolute bottom-0 start-0 bg-dark text-white p-1 m-2 rounded">You</p>
                  </div>
                  <div style={{ position: 'relative', width: '45%' }}>
                    <video
                      ref={videoRefRemote}
                      autoPlay
                      playsInline
                      className="w-100 h-auto"
                      style={{ borderRadius: '10px', border: '1px solid #ccc', backgroundColor: '#f0f0f0' }}
                    />
                    <p className="position-absolute bottom-0 start-0 bg-dark text-white p-1 m-2 rounded">{oppositeUsername}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center">
                <p>Connection status: {peerConnection?.iceConnectionState || 'Not connected'}</p>
                {(!remoteStream && isCalling) && <p>Waiting for remote stream...</p>}
              </div>
              {needsUserInteraction && remoteStream && (
              <div className="text-center mt-2">
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    videoRefRemote.current.play()
                      .then(() => setNeedsUserInteraction(false))
                      .catch(err => console.error("Manual play failed:", err));
                  }}
                >
                  Click to start remote video
                </button>
              </div>
            )}
            </div>
          </div>
        </div>
      )}
      
      {/* Incoming call modal */}
      {incomingCall && !isCalling && (
        <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" 
             style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1050 }}>
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
      
      {/* Emoji picker */}
      {showEmojiPicker && (
        <div className="position-absolute bottom-100 start-0 mb-2">
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