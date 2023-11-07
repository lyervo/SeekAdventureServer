import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

if (process.env.CORS_URL === undefined) {
  process.env.CORS_URL = 'localhost:3000';
}

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_URL,
    allowedHeaders: ['sa-client'],
    credentials: true,
  },
});
const port = 3001;
const SOCKET_TIMEOUT = 15000;

app.use(cors);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

io.on('connection', (socket) => {
  let roomId = '';
  const checkConnectionInterval = setInterval(() => {
    if (socket.connected) {
      //console.log('Connection is still active');
    } else {
      console.log('Connection timed out');
    }
  }, SOCKET_TIMEOUT);

  console.log('A user connected');
  socket.on('disconnect', () => {
    clearInterval(checkConnectionInterval);
    console.log('A user disconnected');
  });
  socket.on('message', (author, message) => {
    console.log(`${author}:${message}`);
  });
  socket.on('create-room', (newRoomId) => {
    console.log(`${newRoomId} room created`);
    socket.join(newRoomId);
    roomId = newRoomId;
  });
  socket.on('join-room', (newRoomId) => {
    roomId = newRoomId;
    socket.join(roomId);
  });

  const sendToAll = (action, params) => {
    socket.broadcast.to(roomId).emit(action, params);
    socket.emit('server-message', params);
  };
});

io.listen(3001);
