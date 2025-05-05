const express = require('express');
const path = require('path');
const cors = require('cors');
const http = require('http'); // Import http module
const { Server } = require('socket.io'); // Import Socket.IO
const app = express();
const archiveChats = require('./services/cron'); // Import the cron job for archiving chats
archiveChats(); // Start the cron job
const routes = require('./routes/indexRoutes');
const sequelize = require('./utils/database');

require('dotenv').config();
const fs = require('fs');


// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ credentials: true })); // Adjust the origin as needed
app.use('/api', routes);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Create an HTTP server and attach Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins (adjust for production)
    methods: ["GET", "POST"],
  },
});

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for chat messages
  socket.on('sendMessage', (data) => {
    console.log('Message received:', data);
    io.to(data.groupId).emit('receiveMessage', data); // Broadcast to the group
  });

  // Join a group room
  socket.on('joinGroup', (groupId) => {
    socket.join(groupId);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Sync database and start the server
sequelize
  .sync({ force: false }) // Set force to true only for development/testing purposes
  .then(() => {
    server.listen(process.env.PORT || 3000, () => {
      console.log(`Server is running on port ${process.env.PORT || 3000}`);
    });
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
  });