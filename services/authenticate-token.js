let jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const nullCookie =
  "__auth_token=null" +
  "; Max-Age=0; Path=/" +
  "; Expires=" +
  new Date("Thu, 01 Jan 1970 00:00:00 GMT").toUTCString() +
  "; Secure; HttpOnly; SameSite=None";

function verifyToken(req, res, next) {
  try {
    const token = req.headers.cookie
      .split(";")
      .find((cookie) => "__auth_token")
      .split("=")[1];

    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        res.setHeader("Set-Cookie", nullCookie);
        return res.status(401).send({
          auth: false,
          message: "Failed to authenticate token.",
        });
      }

      if (req.body.userId && req.body.userId !== decoded.userId) {
        res.setHeader("Set-Cookie", nullCookie);
        res.status(401).send({ auth: false, message: "Invalid session." });
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
