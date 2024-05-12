const express = require("express");
const authRoutes = require("./routes/authRoutes");
const openaiRoutes = requires("./routes/integrations/OpenAI");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());
app.options("*", cors()); // Enable CORS pre-flight request for all routes
app.use("/api/auth", authRoutes);
app.use("/api/integrations/generate", openaiRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
