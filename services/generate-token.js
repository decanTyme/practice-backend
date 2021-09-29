const jwt = require("jsonwebtoken");

function generateAccessToken(userData, type) {
  if (type === "REFRESH_TOKEN") {
    return jwt.sign({ user: userData }, process.env.TOKEN_SECRET_REFRESH, {
      expiresIn: "7d",
    });
  } else {
    return jwt.sign({ user: userData }, process.env.TOKEN_SECRET, {
      expiresIn: "30m",
    });
  }
}

module.exports = generateAccessToken;
