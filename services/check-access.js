const checkAccess = (req, res, next) => {
  // Check if the user has authority
  if (!req.access)
    return res.status(403).json({
      success: false,
      message: "Sorry, you don't have enough priviliges to do that.",
    });

  next();
};

module.exports = checkAccess;
