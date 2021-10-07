const express = require("express");
const customerCtrl = require("../controllers/customer");

const router = express.Router();

// Item management routes
router.get("/", customerCtrl.load);
router.post("/add", customerCtrl.add);
router.patch("/modify", customerCtrl.modify);
router.delete("/del", customerCtrl.delete);

module.exports = router;
