const express = require("express");
const { load, add } = require("../controllers/couriers");

const router = express.Router();

// Item management routes
router.get("/", load);
router.post("/add", add);
// router.patch("/modify", authenticateToken, modify);
// router.delete("/del", authenticateToken, remove);

module.exports = router;
