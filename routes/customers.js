const express = require("express");
const customerCtrl = require("../controllers/customer");
const authenticateToken = require("../services/authenticate-token");

const router = express.Router();

// Item management routes
router.get("/", authenticateToken, customerCtrl.load);
router.post("/add", authenticateToken, customerCtrl.add);
router.patch("/modify", authenticateToken, customerCtrl.modify);
router.delete("/del", authenticateToken, customerCtrl.delete);

module.exports = router;
