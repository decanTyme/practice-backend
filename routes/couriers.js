const express = require("express");
const { load, add, remove, modify } = require("../controllers/couriers");
const checkAccess = require("../services/access-check");

const router = express.Router();

// Item management routes
router.get("/", load);
router.post("/add", checkAccess, add);
router.patch("/modify", checkAccess, modify);
router.delete("/del", checkAccess, remove);

module.exports = router;
