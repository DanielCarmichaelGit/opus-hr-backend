const express = require("express");
const http = require('http');
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
const openaiRoutes = require("./routes/integrations/OpenAI");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // Be sure to set the correct origins in a production environment
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());
app.options("*", cors()); // Enable CORS pre-flight request for all routes
app.use("/api/auth", authRoutes);
app.use("/api/integrations/generate", openaiRoutes);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle generation request from client
  socket.on('generateRequest', async (data) => {
    try {
      // Assume this function generates and polls until the result is ready
      const result = await handleGeneration(data);
      socket.emit('generationComplete', result);
    } catch (error) {
      socket.emit('error', { message: "Generation failed", error: error.message });
    }
  });
});

module.exports.io = io;

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
