require("dotenv").config();
const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const { v4: uuidv4 } = require("uuid");
const Avatar = require("../../models/avatar");
const User = require("../../models/user");
const dbConnect = require("../../utils/dbConnect");
const { authMiddleware } = require("../../middleware/authMiddleware");

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

// create avatar route
router.post("/generate-test", authMiddleware, async (req, res) => {
  const user_id = req.userId;
  const { prompt } = req.body;

  console.log(1, req);
  if (user_id) {
    console.log(2);
    dbConnect(process.env.DB_CONNECTION_STRING);

    if ((prompt)) {
      console.log(3);
      try {
        // Check if the user already exists
        const existingUser = await User.findOne({ user_id });
        console.log(4);
        if (!existingUser) {
          console.log(5);
          return res.status(404).json({ message: "could not find account" });
        }

        console.log(6)
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });

        console.log(7)
        // create thread
        const thread = await openai.beta.threads.create();

        console.log(8)
        // create thread message
        const message = await openai.beta.threads.messages.create(thread.id, {
          role: "user",
          content: prompt,
        });

        console.log(9)
        // run thread using asistant
        let run = await openai.beta.threads.runs.createAndPoll(thread.id, {
          assistant_id: process.env.OPEN_AI_TEST_ASSISTANT,
        });

        console.log(10)
        if (run.status === 'completed') {
          const messages = await openai.beta.threads.messages.list(
            run.thread_id
          );
          console.log(11)
          for (const message of messages.data.reverse()) {
            console.log(`${message.role} > ${message.content[0].text.value}`);
            console.log(12)
          }
        } else {
          console.log(run.status);
          console.log(13)
        }

        res.status(200).json({
          message: "test created"
        });
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
