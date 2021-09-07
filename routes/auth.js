const express = require("express");
const authCtrl = require("../controllers/auth");
const authenticateToken = require("../services/authenticate-token");
const checkDbConnection = require("../services/db-check");

const router = express.Router();

// Pings the database to check if it is connected
router.get("/ping", authenticateToken, checkDbConnection, authCtrl.ping);

// Authentication routes
router.post("/signup", authCtrl.signup);
router.post("/login", authCtrl.login);
router.post("/signoff", authenticateToken, authCtrl.signoff);
router.post("/authenticate", authenticateToken, authCtrl.authenticate);

const User = require("../models/users");
router.post("/user", authenticateToken, (req, res, next) => {
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
});

module.exports = router;
