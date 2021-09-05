let jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function verifyToken(req, res, next) {
  try {
    const token = req.headers.cookie.split(";")[0].split("=")[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).send({
          auth: false,
          message: "Failed to authenticate token.",
        });

      if (req.body.userId && req.body.userId !== decoded.userId) {
        res.status(401).json({ auth: false, message: "Invalid session." });
        throw "EINVSESS";
      } else {
        req.authDecoded = decoded;
        next();
      }
    });
  } catch (error) {
    if (error instanceof TypeError) {
      res.status(418).json({
        auth: false,
        message: "No token provided.",
      });
    }
  }
}

module.exports = verifyToken;
