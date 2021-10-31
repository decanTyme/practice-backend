const jwt = require("jsonwebtoken");

function generateAccessToken(userData, type) {
  if (type === "REFRESH_TOKEN")
    return jwt.sign({ user: userData }, process.env.TOKEN_SECRET_REFRESH, {
      expiresIn: "3d",
      issuer: "polar-wave-26304.herokuapp.com",
    });

  return jwt.sign({ user: userData }, process.env.TOKEN_SECRET, {
    expiresIn: "30m",
    issuer: "polar-wave-26304.herokuapp.com",
  });
}

module.exports = generateAccessToken;
