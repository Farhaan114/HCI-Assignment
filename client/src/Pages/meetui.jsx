import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const Meet = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef(null);
  const mainVideoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const initializeWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (videoRef.current && mainVideoRef.current) {
          videoRef.current.srcObject = stream;
          mainVideoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsLoading(false);
      } catch (error) {
        console.error('Error accessing webcam:', error);
        setIsLoading(false);
      }
    };

    initializeWebcam();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      // Handle sending message
      setMessage('');
    }
  };

  const handleLeave = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate('/chat');
  };

  return (
    <div className="vh-100 vw-100 bg-dark d-flex">
      <div className="row m-0 w-100">
        {/* Participants Panel */}
        <div className="col-2 p-2">
          <div className="bg-dark border border-secondary rounded-3 p-3 h-100">
            <h5 className="text-success mb-3">Participants</h5>
            <div className="participant-list">
              <div className="d-flex align-items-center mb-2">
                <div className="participant-avatar bg-secondary rounded-circle me-2" style={{ width: '32px', height: '32px' }}></div>
                <span className="text-light">You</span>
              </div>
              {/* Add more participants here */}
            </div>
          </div>
        </div>

        {/* Main Video Section */}
        <div className="col-8 p-2">
          <div 
            className="main-video-container bg-dark border border-secondary rounded-3 position-relative h-100"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
          >
            {isLoading && (
              <div className="position-absolute top-50 start-50 translate-middle">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}
            <video
              ref={mainVideoRef}
              className="w-100 h-100 object-fit-cover rounded-2"
              autoPlay
              playsInline
            />

            {/* Picture-in-Picture Video */}
            <div 
              className="pip-video-container position-absolute"
              style={{ 
                width: '225px', 
                aspectRatio: '16/9',
                bottom: showControls ? '80px' : '20px',
                right: '20px',
                transition: 'bottom 0.3s ease'
              }}
            >
              <div className="video-container bg-dark border border-secondary rounded-3 h-100 position-relative">
                {isLoading && (
                  <div className="position-absolute top-50 start-50 translate-middle">
                    <div className="spinner-border text-success" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                )}
                <video
                  ref={videoRef}
                  className="w-100 h-100 object-fit-cover rounded-2"
                  autoPlay
                  playsInline
                />
              </div>
            </div>

            {/* Hover Controls */}
            {showControls && (
              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-3">
                <button 
                  className="btn btn-outline-success border-2 rounded-circle d-flex align-items-center justify-content-center p-0"
                  onClick={toggleMute}
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className={`bi ${isMuted ? 'bi-mic-mute' : 'bi-mic'} fs-5`}></i>
                </button>
                <button 
                  className="btn btn-outline-success border-2 rounded-circle d-flex align-items-center justify-content-center p-0"
                  onClick={toggleVideo}
                  style={{ width: '40px', height: '40px' }}
                >
                  <i className={`bi ${isVideoOff ? 'bi-camera-video-off' : 'bi-camera-video'} fs-5`}></i>
                </button>
                <button 
                  className="btn btn-outline-danger border-2 rounded-circle d-flex align-items-center justify-content-center p-0"
                  style={{ width: '40px', height: '40px' }}
                  onClick={handleLeave}
                >
                  <i className="bi bi-telephone-x fs-5"></i>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Chat Section */}
        <div className="col-2 p-2">
          <div className="bg-dark border border-secondary rounded-3 h-100 d-flex flex-column">
            <div className="p-3 border-bottom border-secondary">
              <h5 className="text-success mb-0">Chat</h5>
            </div>
            <div className="chat-messages flex-grow-1 p-3 overflow-auto">
              {/* Chat messages will go here */}
            </div>
            <form onSubmit={handleSendMessage} className="p-3 border-top border-secondary mt-auto">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control bg-dark text-light border-success border-2"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <button className="btn btn-outline-success border-2" type="submit">
                  Send
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Meet;
