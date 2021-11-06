const jwt = require("jsonwebtoken");

/**
 * Handles verification of authentication tokens.
 *
 * @param  {Express.Request} req
 * @param  {Express.Response} res
 * @param  {Express.next} next
 *
 * @return {*}
 */
function verifyToken(req, res, next) {
  try {
    /* Get auth cookie from headers */
    const token = req.cookies["__auth_t"];

    /* If token is undefined or null, throw an error */
    if (!token) throw new Error("Token invalid or not found");

    /* If there is a token, verify */
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    req.user = decoded.user;
    req.access = decoded.user.access;

    next();
  } catch (error) {
    console.log(req.path, "Token verification error:", error.message);

    if (error instanceof jwt.TokenExpiredError)
      return res.status(403).json({
        hasToken: true,
        auth: false,
        message: "Session expired. Please login again.",
      });

    if (error instanceof jwt.JsonWebTokenError)
      return res.status(401).json({
        hasToken: true,
        auth: false,
        message: "Invalid session.",
      });

    res.status(418).json({
      hasToken: false,
      auth: false,
      message: "No authentication provided.",
    });
  }
}

module.exports = verifyToken;
