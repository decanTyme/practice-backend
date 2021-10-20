const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    /* Get auth cookie from headers */
    const token = req.cookies.__auth_token;

    /* If token is undefined or null, throw an error */
    if (!token) throw new Error();

    /* If there is a token, verify */
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    const access = decoded.user.role.toLowerCase() === "administrator";

    req.user = decoded.user;
    req.access = access;

    next();
  } catch (error) {
    console.log(error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(403).json({
        hasToken: true,
        auth: false,
        message: "Session expired. Please login again.",
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        hasToken: true,
        auth: false,
        message: "Invalid session.",
      });
    }

    res.status(418).json({
      hasToken: false,
      auth: false,
      message: "No authentication provided.",
    });
  }
}

module.exports = verifyToken;
