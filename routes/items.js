const express = require("express");
const itemCtrl = require("../controllers/items");
const authenticateToken = require("../services/authenticate-token");

const router = express.Router();

// Item management routes
router.get("/load?", authenticateToken, itemCtrl.load);
router.post("/add?", authenticateToken, itemCtrl.addProduct);
router.put("/modify", authenticateToken, itemCtrl.updateProduct);
router.delete("/del?", authenticateToken, itemCtrl.deleteProduct);

module.exports = router;
