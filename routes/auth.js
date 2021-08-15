const express = require("express");
const authCtrl = require("../controllers/auth");
const authenticateToken = require("../services/authenticate-token");

const router = express.Router();

// Pings the database to check if it is connected
router.get("/ping", authenticateToken, authCtrl.ping);

// Authentication routes
router.post("/login", authCtrl.login);
router.post("/signup", authCtrl.signup);
router.get("/authenticate", authenticateToken, authCtrl.authenticate);

module.exports = router;
