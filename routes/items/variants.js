const express = require("express");
const authenticateToken = require("../../services/authenticate-token");
const {
  load,
  add,
  modify,
  remove,
} = require("../../controllers/products/variants");
const checkAccess = require("../../services/access-check");

const router = express.Router();

// Item management routes
router.get("/", load);
router.post("/add", checkAccess, add);
router.patch("/modify", checkAccess, modify);
router.delete("/del", checkAccess, remove);

module.exports = router;
