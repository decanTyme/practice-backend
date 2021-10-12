const express = require("express");
const authenticateToken = require("../../services/authenticate-token");
const {
  load,
  add,
  modify,
  remove,
} = require("../../controllers/products/variants");

const router = express.Router();

// Item management routes
router.get("/", authenticateToken, load);
router.post("/add", authenticateToken, add);
router.patch("/modify", authenticateToken, modify);
router.delete("/del", authenticateToken, remove);

module.exports = router;
