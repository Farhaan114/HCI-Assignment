const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const createUsersTable = require('./models/users');
const createChatsTable = require('./models/chats');
const createVideoCallsTable = require('./models/video_calls');
const createTasksTable = require('./models/tasks');
const authRoutes = require('./routes/auth');
const { Server } = require('socket.io');
const http = require('http');
const userRoutes = require('./routes/users');
const chatRoutes = require('./routes/chats');
const groupRoutes = require('./routes/groups');
const videoCallRoutes = require('./routes/video_calls');
const taskRoutes = require('./routes/tasks');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://2fd1-182-74-172-122.ngrok-free.app"
    ],
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors()); // Enable CORS for all routes
app.use(express.json());
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "https://2fd1-182-74-172-122.ngrok-free.app"
  ]
}));


// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a private room based on sorted user IDs
  socket.on('join-room', (data) => {
    let roomId;
    if (typeof data === 'string') {
      roomId = data; // If it's already a roomId string
    } else {
      // If it's an object with userId1 and userId2
      const { userId1, userId2 } = data;
      roomId = [userId1, userId2].sort().join('-');
    }
    socket.join(roomId);
    socket.roomId = roomId; // Save for later use
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });

  // Handle chat messages
  socket.on('send-message', (message) => {
    // Use senderId and receiverId from message instead of userId1/userId2
    const roomId = [message.senderId, message.receiverId].sort().join('-');
    io.to(roomId).emit('receive-message', message);
  });

  // Initiate video call
  socket.on('start-video-call', ({ userId1, userId2 }) => {
    const roomId = [userId1, userId2].sort().join('-');
    socket.to(roomId).emit('incoming-call', { from: userId1 });
  });

  // Accept video call
socket.on('accept-video-call', ({ userId1, userId2 }) => {
  const roomId = [userId1, userId2].sort().join('-');
  socket.to(roomId).emit('call-accepted', { from: userId1 });
});


  // WebRTC signaling: offer
  socket.on('offer', (offer) => {
    socket.to(socket.roomId).emit('offer', offer);
  });

  // WebRTC signaling: answer
  socket.on('answer', (answer) => {
    socket.to(socket.roomId).emit('answer', answer);
  });

  // WebRTC signaling: ICE candidates
  socket.on('ice-candidate', (candidate) => {
    socket.to(socket.roomId).emit('ice-candidate', candidate);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});


// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to the database');
  release();
});

// Call the function to create the table
createUsersTable();
createChatsTable();
createVideoCallsTable();
createTasksTable();

app.use('/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/video-calls', videoCallRoutes);
app.use('/api/tasks', taskRoutes);

app.get('/', (req, res) => {
  res.send('Hello this is fraan server!');
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 