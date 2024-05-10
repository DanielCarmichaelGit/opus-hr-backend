const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const payload = { userId: user._id };
  const secret = process.env.SECRET_JWT;
  const options = { expiresIn: "7d" };
  const token = jwt.sign(payload, secret, options);
  return token;
};

module.exports = generateToken;
