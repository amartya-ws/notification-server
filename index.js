const express = require("express");
const app = express();
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

app.use(cors);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

let onlineUsers = [];

const addNewUser = (userId, socketId) => {
  let user = onlineUsers.find((user) => user.userId === userId);
  if (!user) {
    onlineUsers = [...onlineUsers, { userId, socketId }];
  }
  console.log(onlineUsers);
};

const removeUser = (socketId) => {
  onlineUsers = onlineUsers.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return onlineUsers.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  // adds the user to onlineUsers array when a new connection is established from the seller side
  socket.on("new user seller", (username) => {
    if (username) {
      addNewUser(username, socket.id);
    }
    console.log(username);
  });

  // listens to buyer offer and emits a notification for the seller having the id
  socket.on("buyer offer made", ({ msg, writerId }) => {
    let user = getUser(writerId);

    if (user?.socketId) {
      io.to(user?.socketId).emit("buyer offer", {
        message: msg,
      });
    }
  });

  // removes user from onlineUsers when user disconnects
  socket.on("disconnect", () => {
    removeUser(socket.id);
    console.log("disconnected");
  });
});

server.listen(3001, () => {
  console.log("server is running");
});
