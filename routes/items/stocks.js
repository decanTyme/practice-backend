const express = require("express");
const {
  load,
  add,
  modify,
  mark,
  move,
  remove,
} = require("../../controllers/stocks");
const checkAccess = require("../../services/check-access");

const router = express.Router();

// Item management routes
router.get("/", load);

// Require appropriate authorization
router.use(checkAccess);

router.post("/add", add);
router.patch("/modify", modify);
router.patch("/mark", mark);
router.patch("/move", move);
router.delete("/del", remove);

module.exports = router;
