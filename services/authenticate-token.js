const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    /* Get auth cookie from headers */
    const token = req.cookies.__auth_token;

    /* If token is undefined or null, throw an error */
    if (!token) throw new Error();

    /* If there is a token, verify */
    jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).send({
          hasToken: true,
          auth: false,
          message: "Session expired. Please login again.",
        });
      }

      if (req.body.userId && req.body.userId !== decoded.userId) {
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
    res.status(418).json({
      hasToken: false,
      auth: false,
      message: "No authentication token provided.",
    });
  }
}

module.exports = verifyToken;
