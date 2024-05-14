const { Server } = require("socket.io");
const http = require("http");
const { server } = require("../server");

const io = new Server(server, {
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"],
  },
});

// Middleware function to attach the socket.io instance to the request object
const attachIO = (req, res, next) => {
  req.io = io;
  next();
};

module.exports = { attachIO };