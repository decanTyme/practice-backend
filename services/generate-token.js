const jwt = require("jsonwebtoken");

function generateAccessToken(userId, type) {
  if (type === "REFRESH_TOKEN") {
    return jwt.sign({ userId }, process.env.TOKEN_SECRET_REFRESH, {
      expiresIn: "7d",
    });
  } else {
    return jwt.sign({ userId }, process.env.TOKEN_SECRET, {
      expiresIn: "30m",
    });
  }
}

module.exports = generateAccessToken;
