// backend/Server.js
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

// --- WebRTC + Chat Signaling ---
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a room
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // WebRTC offer
  socket.on("offer", (data) => {
    socket.to(data.room).emit("offer", {
      sdp: data.sdp,
      from: socket.id
    });
  });

  // WebRTC answer
  socket.on("answer", (data) => {
    socket.to(data.room).emit("answer", {
      sdp: data.sdp,
      from: socket.id
    });
  });

  // ICE candidates
  socket.on("ice-candidate", (data) => {
    socket.to(data.room).emit("ice-candidate", {
      candidate: data.candidate,
      from: socket.id
    });
  });

  // Group chat
  socket.on("chat-message", (data) => {
    io.to(data.room).emit("chat-message", {
      message: data.message,
      from: socket.id
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.get("/", (req, res) => {
  res.send("Expert Engine backend running");
});

server.listen(3001, () => {
  console.log("Backend running on http://localhost:3001");
});
