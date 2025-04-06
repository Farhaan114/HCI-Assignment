import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { getChatMessagesBetweenUsers } from '../Services/chatService';
import { getUserById } from '../Services/userService';
import { io } from 'socket.io-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaVideo } from 'react-icons/fa';

const ChatDetail = () => {
  const { userId } = useParams();
  const currentUserId = localStorage.getItem('userId'); // Assuming userId is stored in localStorage
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
  const videoRefLocal = useRef(null);
  const videoRefRemote = useRef(null);

  useEffect(() => {
    const socketInstance = io('http://localhost:3000'); // Connect to the server
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
  
  if (videoRefRemote.current && remoteStream) {
    videoRefRemote.current.srcObject = remoteStream;
  }
  

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
    const messageData = {
      username: localStorage.getItem('username'),
      userId1: currentUserId,
      userId2: userId,
      chat: newMessage,
      datetime: new Date().toISOString(),
    };
  
    socket.emit('send-message', messageData);
    setNewMessage('');
  };
  
  const handleStartCall = () => {
    setIsCalling(true);
    socket.emit('start-video-call', { userId1: currentUserId, userId2: userId });
  };

  const audioRefRemote = useRef(null);

  

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Chat with {oppositeUsername}</h2>
        <FaVideo size={30} className="text-primary" style={{ cursor: 'pointer' }} onClick={handleStartCall} />

      </div>
      <div className="connection-status">Connection Status: {connectionStatus}</div>
      <div className="chat-messages">
        {messages.length > 0 ? (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.username === localStorage.getItem('username') ? 'text-right' : 'text-left'}`}>
              <p><strong>{message.username}:</strong> {message.chat}</p>
            </div>
          ))
        ) : (
          <p>{error}</p>
        )}
      </div>
      <div className="input-group mt-3">
        <input
          type="text"
          className="form-control"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
        />
        <button className="btn btn-primary" onClick={handleSendMessage}>Send</button>
      </div>
      {incomingCall && (
        <div className="alert alert-info">
          Incoming video call from {oppositeUsername}
          <button className="btn btn-success ms-3" onClick={handleJoinCall}>Join Call</button>
        </div>
      )}

      {isCalling || incomingCall ? (
        <div className="video-container d-flex gap-3 mt-3">
          <video ref={videoRefLocal} autoPlay muted className="border" width="300" />
          <video ref={videoRefRemote} autoPlay className="border" width="300" />
          <audio ref={audioRefRemote} autoPlay />

        </div>
      ) : null}

    </div>
  );
};

export default ChatDetail; 