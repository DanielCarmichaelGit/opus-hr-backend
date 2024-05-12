const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = { userId: user.user_id };
  const secret = process.env.JWT_SECRET;
  const options = { expiresIn: "7d" };
  const token = jwt.sign(payload, secret, options);
  return token;
};

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { generateToken, authMiddleware };