const { Server } = require("socket.io");
const http = require("http");
const { server } = require("../server"); // Make sure 'server' is correctly exported and imported
const { io } = require("../server");

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

function attachIo(req, res, next) {
  req.io = io; // Ensure 'io' is defined here as imported from 'server.js'
  next();
}

module.exports = { server, io };
