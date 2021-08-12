let jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

function verifyToken(req, res, next) {
  let bearer = req.headers["authorization"];
  let token = bearer?.split(" ");

  try {
    jwt.verify(token[1], process.env.TOKEN_SECRET, (err, decoded) => {
      if (err)
        return res.status(401).send({
          auth: false,
          message: "Failed to authenticate token.",
        });

      req.authDecoded = decoded;
      next();
    });
  } catch (error) {
    if (error instanceof TypeError) {
      console.log("No token provided.");
      res.status(418).json({
        auth: false,
        message: "No token provided.",
      });
    }
  }
}

module.exports = verifyToken;
