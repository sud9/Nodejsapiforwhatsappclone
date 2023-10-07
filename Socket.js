const http = require("http");
const express = require("express");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.get("/socket", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });

//   socket.on("message", (data) => {
//     console.log("Received message:", data);
//     io.emit("message", data); // Broadcast the message to all connected clients
//   });
// });
const connectedUsers = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("join", (roomId) => {
    socket.join(roomId);
    console.log(roomId);
  });
  socket.on("usermessage", (data, room) => {
    console.log("Received messages from user:", data, room);
    // connectedUsers[socket.id] = data;
    // console.log(connectedUsers);
    socket.broadcast.emit("message", data, room); // Broadcast the message to all connected clients
  });

  // socket.on("send", (message) => {
  //   socket.broadcast.emit("receive", {
  //     message: message,
  //     name: connectedUsers[socket.id],
  //   });
  // });
  socket.on("disconnect", () => {
    console.log("User disconnected");
    // users--;
    // io.emit("userCount", users + "user disconnected!");
  });
});

server.listen(5000, () => {
  console.log("Server is running on port 5000");
});
