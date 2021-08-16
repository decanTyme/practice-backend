const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mongoose model imports
const User = require("../models/users");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.username, 12)
    .then((hash) => {
      const newUser = new User({
        username: req.body.username,
        password: hash,
      });

      newUser
        .save()
        .then(() => {
          res.json({ message: "User added successfully." });
        })
        .catch((error) => {
          res.status(500).json({
            error: error,
            message: "There was an error in saving the user.",
          });
        });
    })
    .catch((error) => {
      res.status(500).json({
        error: error,
        message: "Unexpected error. Try again later.",
      });
    });
};

exports.login = (req, res, next) => {
  User.findOne({ username: req.body.username }).then((user) => {
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    bcrypt.compare(req.body.password, user.password).then((valid) => {
      if (!valid)
        return res.status(401).json({ error: "Invalid credentials." });

      const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: "10m",
      });

      const decoded = jwt.decode(token, process.env.TOKEN_SECRET);
      res.status(200).json({
        userId: user._id,
        token: token,
        iat: decoded.iat,
        exp: decoded.exp,
      });
    });
  });
};

exports.authenticate = (req, res, next) => {
  res.status(200).send({ auth: true });
};

exports.ping = (req, res, next) => {
  if (!req.isDbConnected)
    return res
      .status(500)
      .json({ error: req.dbErr, message: "Database connect error" });

  return res.json({ auth: true });
};
