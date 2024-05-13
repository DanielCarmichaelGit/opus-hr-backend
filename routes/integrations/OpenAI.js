require("dotenv").config();
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { v4: uuidv4 } = require("uuid");
const Avatar = require("../../models/avatar");
const User = require("../../models/user");
const dbConnect = require("../../utils/dbConnect");
const { authMiddleware } = require("../../middleware/authMiddleware");
const io = require("../../server"); // Import the io instance

router.post("/generate-test", authMiddleware, async (req, res) => {
  const user_id = req.userId;
  const { prompt } = req.body;

  if (!user_id) {
    return res.status(409).json({ message: "invalid authentication" });
  }

  console.log("Received request:", req.body);
  dbConnect(process.env.DB_CONNECTION_STRING);

  if (!prompt) {
    return res
      .status(400)
      .json({ message: "please include all necessary data" });
  }

  console.log("Database connected, creating OpenAI instance...");
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Immediately respond to the HTTP request indicating that the process has started
  res
    .status(202)
    .json({
      message: "Test creation in progress. Results will be sent via socket.",
    });

  try {
    console.log("Running assistant...");
    const run = await openai.beta.threads.createAndRun({
      assistant_id: process.env.OPEN_AI_TEST_ASSISTANT,
      thread: {
        messages: [
          { role: "user", content: JSON.stringify(prompt) },
        ],
      },
    });

    console.log("Fetching messages...");
    // Check periodically or use an event-based approach if the API supports it
    const interval = setInterval(async () => {
      const updatedRun = await openai.beta.threads.runs.retrieve(
        run.thread_id,
        run.id
      )

      console.log("UPDATED RUN", updatedRun)

      if (updatedRun.status !== "queued" && updatedRun.status !== "running") {
        clearInterval(interval);
        if (updatedRun.status === "completed") {
          const messages = await openai.beta.threads.messages.list(
            run.thread_id
          );
          console.log("Messages:", messages.data);

          io.emit("testCreated", {
            message: "test created",
            details: messages.data.map((msg) => msg.content[0].text.value),
          });
        } else {
          io.emit("testFailed", {
            message: "Test creation failed with status: " + updatedRun.status,
          });
        }
      }
    }, 5000); // Check every 5 seconds
  } catch (err) {
    console.error("Error during API interaction:", err);
    io.emit("testFailed", { message: "server error", error: err.message });
  }
});

// create avatar route
router.post("/generate-avatar", authMiddleware, async (req, res) => {
  const user_id = req.userId;
  const {
    gender,
    name,
    hairColor,
    avatarPrompt,
    useExisting = false,
  } = req.body;

  console.log(1, req);
  if (user_id) {
    console.log(2);
    dbConnect(process.env.DB_CONNECTION_STRING);

    if ((gender, name, hairColor, avatarPrompt)) {
      console.log(3);
      try {
        // Check if the user already exists
        const existingUser = await User.findOne({ user_id });
        console.log(4);
        if (!existingUser) {
          console.log(5);
          return res.status(404).json({ message: "could not find account" });
        }

        console.log(6);
        const existingAvatar = await Avatar.findOne({ owned_by_id: user_id });
        console.log(existingAvatar);

        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        console.log(7);

        if (existingAvatar && useExisting) {
          // add existing configs to new configs
        } else {
          console.log(8);
          const image = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Generate a headshot of a character with ${hairColor} hair and ${gender} appearance. The character should be depicted alone, with no background or additional elements such as color palettes or background, and the style should be 64bit.`,
          });
          console.log(9, image);

          const avatar_id = uuidv4();
          const new_avatar = new Avatar({
            avatar_id,
            avatar_name: name,
            avatar_gender: gender,
            avatar_hair_color: hairColor,
            avatar_image: image.data[0].url,
            owned_by_id: user_id,
          });

          console.log(10);

          await new_avatar.save();

          console.log(11);

          res.status(200).json({
            message: "avatar created",
            avatar: new_avatar,
          });
        }
      } catch (err) {
        res.status(500).json({ message: "server error" });
      }
    } else {
      res.status(400).json({
        message: "please include all necessary data",
      });
    }
  } else {
    res.status(409).json({
      message: "invalid authentication",
    });
  }
});

module.exports = router;
