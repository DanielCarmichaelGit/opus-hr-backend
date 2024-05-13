const { Server } = require("socket.io");
const http = require('http');
const server = require('../server'); // Ensure this import makes sense based on your actual setup

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

function attachIo(req, res, next) {
    req.io = io;
    next();
}

module.exports = { attachIo, io };
