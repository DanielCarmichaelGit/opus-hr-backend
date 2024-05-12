const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { hashPassword, comparePassword } = require("../utils/passwordUtils");
const { generateToken } = require("../middleware/authMiddleware");
const dbConnect = require("../utils/dbConnect");
const uuidv4 = require("uuidv4");

// Sign-up route
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;
  console.log(1)

  dbConnect(process.env.DB_CONNECTION_STRING);
  console.log(2)

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    console.log(3)
    if (existingUser) {
      console.log(4)
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);
    console.log(5)
    console.log(uuidv4())
    const user_id = uuidv4();
    // Create a new user
    const newUser = new User({
      user_id,
      email,
      password: hashedPassword,
    });
    console.log(6)
    await newUser.save();

    // Generate and return a JWT token
    const token = generateToken(newUser);
    res.status(201).json({ token });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  dbConnect(process.env.DB_CONNECTION_STRING);

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare the password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate and return a JWT token
    const token = generateToken(user);

    console.log(token);
    res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
