let jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();

const nullCookie =
  "__auth_token=null" +
  "; Max-Age=0; Path=/" +
  "; Expires=" +
  new Date("Thu, 01 Jan 1970 00:00:00 GMT").toUTCString() +
  "; Secure; HttpOnly; SameSite=None";

const getCookie = (cookies, type) => {
  let cookieArr = cookies.split(";");

  for (let i = 0; i < cookieArr.length; i++) {
    let cookiePair = cookieArr[i].split("=");
    if (type === cookiePair[0].trim()) {
      return decodeURIComponent(cookiePair[1]);
    }
  }
  return null;
};

function verifyToken(req, res, next) {
  if (req.path !== "/signoff") {
    try {
      /* Get auth cookie from headers */
      const token = getCookie(req.headers.cookie, "__auth_token");

      jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
        if (err) {
          res.setHeader("Set-Cookie", nullCookie);
          return res.status(401).send({
            hasToken: true,
            auth: false,
            message: "Failed to authenticate token.",
          });
        }

        if (req.body.userId && req.body.userId !== decoded.userId) {
          res.setHeader("Set-Cookie", nullCookie);
          res
            .status(401)
            .send({ hasToken: true, auth: false, message: "Invalid session." });
          throw "EINVSESS";
        } else {
          req.authDecoded = decoded;
          next();
        }
      });
    } catch (error) {
      if (error instanceof TypeError) {
        res.status(418).json({
          hasToken: false,
          auth: false,
          message: "No authentication token provided.",
        });
      }
    }
  } else next();
}

module.exports = verifyToken;
