const jwt = require("jsonwebtoken");
const dbConnect = require("../utils/dbConnect");
const OpenAI = require("openai");
const User = require("../models/user");
const Test = require("../models/baseTest");
const { v4: uuidv4 } = require("uuid");

const socketHandler = (socket, io) => {
  // Middleware to verify token
  socket.use((packet, next) => {
    if (packet[0] === "authenticate") {
      const token = packet[1];
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
          next(new Error("Authentication error"));
        } else {
          socket.user = decoded;
          next();
        }
      });
    } else {
      next();
    }
  });

  // Event handler for 'someevent'
  socket.on("someevent", async (data) => {
    try {
      // Perform some logic
      // Emit updates to the client
      socket.emit("update", { message: "Processing..." });

      // When the logic is complete, emit a final message
      socket.emit("complete", { message: "Task completed" });

      // Close the socket connection
      socket.disconnect();
    } catch (error) {
      console.error("Socket error:", error);
      socket.emit("error", { message: "An error occurred" });
    }
  });

  // Event handler for 'generateTest'
  socket.on("generateTest", async (data) => {
    try {
      const { prompt } = data;
      const user_id = socket.user.userId;

      if (!user_id) {
        socket.emit("error", { message: "Invalid authentication" });
        return;
      }

      console.log("Received request:", data);

      dbConnect(process.env.DB_CONNECTION_STRING);

      if (!prompt) {
        socket.emit("error", { message: "Please include all necessary data" });
        return;
      }

      console.log("Database connected, creating OpenAI instance...");
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      socket.emit("testStatus", { message: "Test creation in progress" });

      console.log("Running assistant...");
      const run = await openai.beta.threads.createAndRun({
        assistant_id: process.env.OPEN_AI_TEST_ASSISTANT,
        thread: {
          messages: [{ role: "user", content: JSON.stringify(prompt) }],
        },
      });

      console.log("Fetching messages...");
      const checkRunStatus = async () => {
        while (true) {
          const updatedRun = await openai.beta.threads.runs.retrieve(
            run.thread_id,
            run.id
          );

          if (updatedRun.status === "completed") {
            console.log("OpenAI run completed successfully!");
            let assistantResponse = {};
            const messages = await openai.beta.threads.messages.list(
              run.thread_id
            );

            for (const message of messages.data.reverse()) {
              if (message.role === "assistant") {
                assistantResponse = message.content[0].text.value;
              }
            }

            if (assistantResponse) {
              console.log("ASSISTANT'S RESPONSE FOUND", assistantResponse);
              const test_id = uuidv4();
              const newBaseTest = new Test({
                test_id,
                owned_by_id: user_id,
                test_content: JSON.parse(assistantResponse),
                source: "manual",
                created_date: Date.now(),
                test_configs: {}
              })

              const saved_test = await newBaseTest.save();

              socket.emit("testResult", { response: saved_test });
            } else {
              console.log("No assistant response found in the messages.");
              socket.emit("testResult", { response: "No response generated" });
            }

            socket.emit("testCompleted");
            socket.disconnect();
            break;
          } else if (
            updatedRun.status !== "queued" ||
            updatedRun.status !== "in_progress"
          ) {
            console.log("Waiting for run to complete...");
            console.log("CURRENT STATUS", updatedRun.status);
            console.log(Date.now());
            await new Promise((resolve) => setTimeout(resolve, 5000));
          } else {
            console.log(`OpenAI run failed with status: ${updatedRun.status}`);
            socket.emit("testFailed", { message: "OpenAI run failed" });
            socket.disconnect();
            break;
          }
        }
      };

      checkRunStatus();
    } catch (err) {
      console.error("Error during API interaction:", err);
      socket.emit("testFailed", {
        message: "Server error",
        error: err.message,
      });
    }
  });

  // Add more socket event handlers as needed
};

module.exports = socketHandler;
