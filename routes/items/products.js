const express = require("express");
const productCtrl = require("../../controllers/items");
const authenticateToken = require("../../services/authenticate-token");

const router = express.Router();

// Item management routes
router.get("/", authenticateToken, productCtrl.load);
router.post("/add", authenticateToken, productCtrl.add);
router.patch("/modify", authenticateToken, productCtrl.updateProduct);
router.delete("/del", authenticateToken, productCtrl.deleteProduct);

module.exports = router;
