const express = require("express");
const customerCtrl = require("../controllers/customer");
const checkAccess = require("../services/access-check");

const router = express.Router();

// Item management routes
router.get("/", customerCtrl.load);
router.post("/add", checkAccess, customerCtrl.add);
router.patch("/modify", checkAccess, customerCtrl.modify);
router.delete("/del", checkAccess, customerCtrl.delete);

module.exports = router;
