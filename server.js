const express = require("express");
const http = require('http');
const socketIO = require('socket.io');
const authRoutes = require("./routes/authRoutes");
const openaiRoutes = require("./routes/integrations/OpenAI");
const socketHandler = require("./routes/socketHandler");
const cors = require("cors");
require("dotenv").config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.json());
app.use(cors());
app.options("*", cors());

app.use("/api/auth", authRoutes);
app.use("/api/integrations/generate", openaiRoutes);

io.on('connection', (socket) => {
  socketHandler(socket, io);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));