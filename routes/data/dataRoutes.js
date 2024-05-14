require("dotenv").config();
const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const User = require("../../models/user");
const Test = require("../../models/baseTest");
const dbConnect = require("../../utils/dbConnect");
const { authMiddleware } = require("../../middleware/authMiddleware");

router.get("/tests", authMiddleware, async (req, res) => {
  const user_id = req.userId;
  const {
    page = 0,
    results_per_page = 25,
    filter_string = "",
    filter_date = 0,
    source = "all",
  } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(results_per_page);

  if (!user_id) {
    return res.status(409).json({ message: "invalid authentication" });
  }

  console.log("Received request:", req.body);

  dbConnect(process.env.DB_CONNECTION_STRING);

  try {
    const query = {
      owned_by_id: user_id,
    };

    if (filter_string !== "") {
      query.test_content = { $regex: filter_string, $options: "i" };
    }

    if (filter_date !== 0) {
      query.created_date = { $gte: filter_date };
    }

    if (source !== "all") {
      query.source = source;
    }

    const totalTests = await Test.countDocuments(query);
    const tests = await Test.find(query)
      .skip(skip)
      .limit(parseInt(results_per_page));

    const hasMore = skip + tests.length < totalTests;

    res.status(200).json({
      tests,
      hasMore,
    });
  } catch (err) {
    console.error("Error trying to fetch tests:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
