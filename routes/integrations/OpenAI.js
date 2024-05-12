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
        console.log(existingAvatar)

        const openai = new OpenAI({
          organization: process.env.OPEN_AI_ORG,
          project: process.env.OPEN_AI_PROJECT,
        });
        console.log(7);

        if (existingAvatar && useExisting) {
          // add existing configs to new configs
        } else {
          console.log(8);
          const image = await openai.images.generate({
            model: "dall-e-3",
            prompt: `Generate an image of a character, with a white background, that is a ${gender} with a hair color of ${hairColor}. The character should be professional. Also, make the character ${avatarPrompt}`,
          });
          console.log(9);

          const new_avatar = new Avatar({
            avatar_id: uuidv4(),
            avatar_name: name,
            avatar_gender: gender,
            avatar_hair_color: hairColor,
            avatar_image: image,
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
