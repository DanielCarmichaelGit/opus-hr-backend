const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const uuidv4 = require("uuidv4");
const Avatar = require("../../models/avatar");
const dbConnect = require("../../utils/dbConnect");
const { authMiddleware } = require("../../middleware/authMiddleware");

// Sign-up route
router.post("/generate-avatar", authMiddleware, async (req, res) => {
  const user_id = req.userId;
  const { gender, name, hairColor, avatarPrompt, useExisting = false } = req.body;

  if (user_id) {
    dbConnect(process.env.DB_CONNECTION_STRING);

    if ((gender, name, hairColor, avatarPrompt)) {
      try {
        // Check if the user already exists
        const existingUser = await User.findOne({ user_id });
        if (!existingUser) {
          return res.status(404).json({ message: "Could not find account" });
        }

        const existingAvatar = await Avatar.findOne({ owned_by_id: user_id });

        const openai = new OpenAI({
          organization: process.env.OPEN_AI_ORG,
          project: process.env.OPEN_AI_PROJECT,
        });

        if (existingAvatar && useExisting) {
          // add existing configs to new configs
        } else {
          const image = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Generate an image of a character, with a white background, that is a ${gender} with a hair color of ${hairColor}. The character should be professional. Also, make the character ${avatarPrompt}`,
          });

          const new_avatar = new Avatar({
            avatar_id: uuidv4(),
            avatar_name: name,
            avatar_gender: gender,
            avatar_hair_color: hairColor,
            avatar_image: image,
            owned_by_id: user_id
          });

          await new_avatar.save();

          res.status(200).json({
            message: "Avatar created",
            avatar: new_avatar
          });
        }
      } catch (err) {
        res.status(500).json({ message: "Server error" });
      }
    } else {
      res.status(400).json({
        message: "Please include all necessary data",
      });
    }
  }
});

module.exports = router;
