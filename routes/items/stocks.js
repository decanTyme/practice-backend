const express = require("express");
const { load, add, modify, move, remove } = require("../../controllers/stocks");

const router = express.Router();

// Item management routes
router.get("/", load);
router.post("/add", add);
router.patch("/modify", modify);
router.patch("/move", move);
router.delete("/del", remove);

module.exports = router;
