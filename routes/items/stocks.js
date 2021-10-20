const express = require("express");
const {
  load,
  add,
  modify,
  mark,
  move,
  remove,
} = require("../../controllers/stocks");
const checkAccess = require("../../services/access-check");

const router = express.Router();

// Item management routes
router.get("/", load);
router.post("/add", checkAccess, add);
router.patch("/modify", checkAccess, modify);
router.patch("/mark", checkAccess, mark);
router.patch("/move", checkAccess, move);
router.delete("/del", checkAccess, remove);

module.exports = router;
