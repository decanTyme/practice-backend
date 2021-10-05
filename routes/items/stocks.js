const express = require("express");
const { load, add, modify, remove } = require("../../controllers/stocks");
const authenticateToken = require("../../services/authenticate-token");

const router = express.Router();

// Item management routes
router.get("/", authenticateToken, load);
router.post("/add", authenticateToken, add);
// router.patch("/modify", authenticateToken, stockCtrl.modifyProduct);
// router.delete("/del", authenticateToken, stockCtrl.deleteProduct);

module.exports = router;
