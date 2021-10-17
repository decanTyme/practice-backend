const express = require("express");
const { load, add, modify, remove } = require("../controllers/brands");

const router = express.Router();

// Item management routes
router.get("/", load);
router.post("/add", add);
router.patch("/modify", modify);
router.delete("/del", remove);

module.exports = router;
