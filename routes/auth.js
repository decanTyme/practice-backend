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
router.post("/signoff", authCtrl.signoff);
router.post("/authenticate", authCtrl.authenticate);

router.post("/user", authenticateToken, authCtrl.user);

module.exports = router;
