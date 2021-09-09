const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Mongoose model imports
const User = require("../models/users");

exports.signup = (req, res, next) => {
  bcrypt
    .hash(req.body.password, 12)
    .then((hash) => {
      bcrypt.compare(req.body.password, hash).then((valid) => {
        if (!valid)
          return res.status(500).json({
            message: "Unexpected error. Try again later.",
          });
      });

      const newUser = new User({
        username: req.body.username,
        password: hash,
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        role: req.body.role,
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
  const client = req.body;
  const longerSignin = JSON.parse(client.rememberUser);
  User.findOne({ username: client.username }).then((user) => {
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const userData = {
      firstname: user.firstname,
      lastname: user.lastname,
      role: user.role,
    };

    bcrypt.compare(client.password, user.password).then((valid) => {
      if (!valid) return res.status(401).json({ error: "Invalid credentials" });

      const tokenExpiry = longerSignin ? "24h" : "5m";
      const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
        expiresIn: tokenExpiry,
      });

      const decoded = jwt.decode(token, process.env.TOKEN_SECRET);

      const tokenCookie =
        "__auth_token=" +
        token +
        "; Max-Age=86400; Path=/" +
        "; Expires=" +
        new Date(decoded.exp * 1000).toUTCString() +
        "; Secure; HttpOnly; SameSite=None";

      res.setHeader("Set-Cookie", tokenCookie);

      res.status(200).json({
        userId: user._id,
        userData: userData,
        iat: decoded.iat,
        exp: decoded.exp,
      });
    });
  });
};

exports.signoff = (req, res, next) => {
  const clientBody = req.body;
  const clientId = clientBody.userId;
  const clientToken = req.headers.cookie
    .split(";")
    .find((cookie) => "__auth_token")
    .split("=")[1];

  const decoded = jwt.decode(clientToken, process.env.TOKEN_SECRET);

  const nullCookie =
    "__auth_token=null" +
    "; Max-Age=0; Path=/" +
    "; Expires=" +
    new Date("Thu, 01 Jan 1970 00:00:00 GMT").toUTCString() +
    "; Secure; HttpOnly; SameSite=None";

  res.setHeader("Set-Cookie", nullCookie);
  res.status(200).json({ signoff: true });
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

exports.user = (req, res, next) => {
  User.findOne({ _id: req.body.userId })
    .then((user) => {
      res.status(200).json({
        firstname: user.firstname,
        lastname: user.lastname,
        role: user.role,
      });
    })
    .catch((error) => {
      res.status(404).json({ error: error, msg: "User not found." });
    });
};
