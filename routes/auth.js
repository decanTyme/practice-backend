const express = require("express");
const authCtrl = require("../controllers/auth");
const verifyToken = require("../services/verify-token");

const router = express.Router();

// Pings the database to check if it is connected
router.get("/ping", verifyToken, authCtrl.ping);

// Authentication routes
router.post("/signup", authCtrl.signup);
router.post("/login", authCtrl.login);
router.post("/signoff", authCtrl.signoff);
router.post("/authenticate", authCtrl.authenticate);

router.post("/user", verifyToken, authCtrl.user);

module.exports = router;
