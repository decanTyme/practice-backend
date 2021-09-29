const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    /* Get auth cookie from headers */
    const token = req.cookies.__auth_token;

    /* If token is undefined or null, throw an error */
    if (!token) throw new Error();

    /* If there is a token, verify */
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    // if (req.body.userId && req.body.userId !== decoded.user.id) {
    //   return res
    //     .status(401)
    //     .json({ hasToken: true, auth: false, message: "Invalid session." });
    // }

    req.access = decoded.user.role.toLowerCase() === "administrator";

    next();
  } catch (error) {
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

    console.log(error);
    res.status(418).json({
      hasToken: false,
      auth: false,
      message: "No authentication provided.",
    });
  }
}

module.exports = verifyToken;
