const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ROOM STATE
const rooms = {}; 
// rooms[roomId] = [socketId, socketId, ...]

io.on("connection", (socket) => {
  console.log("user connected:", socket.id);

  // JOIN ROOM
  socket.on("join-room", (roomId) => {
    if (!rooms[roomId]) rooms[roomId] = [];
    rooms[roomId].push(socket.id);

    socket.join(roomId);

    // Tell existing users about the new user
    socket.to(roomId).emit("user-joined", socket.id);

    // Tell new user who is already in the room
    io.to(socket.id).emit("existing-users", rooms[roomId].filter(id => id !== socket.id));
  });

  // OFFER (mesh)
  socket.on("offer", (data) => {
    io.to(data.to).emit("offer", {
      sdp: data.sdp,
      from: socket.id
    });
  });

  // ANSWER (mesh)
  socket.on("answer", (data) => {
    io.to(data.to).emit("answer", {
      sdp: data.sdp,
      from: socket.id
    });
  });

  // ICE CANDIDATE (mesh)
  socket.on("ice-candidate", (data) => {
    io.to(data.to).emit("ice-candidate", {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // GROUP CHAT
  socket.on("chat-message", (data) => {
    io.to(data.room).emit("chat-message", {
      message: data.message,
      from: socket.id
    });
  });

  // GROUP STREAM BROADCAST
  socket.on("stream-data", (data) => {
    socket.to(data.room).emit("stream-data", {
      chunk: data.chunk,
      from: socket.id
    });
  });

  // DISCONNECT
  socket.on("disconnect", () => {
    console.log("user disconnected:", socket.id);

    for (const roomId in rooms) {
      rooms[roomId] = rooms[roomId].filter(id => id !== socket.id);
      socket.to(roomId).emit("user-left", socket.id);
    }
  });
});

server.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});

