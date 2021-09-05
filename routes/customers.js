const express = require("express");
const customerCtrl = require("../controllers/customer");
const checkAccess = require("../services/check-access");

const router = express.Router();

// Item management routes
router.get("/", customerCtrl.load);

// Require appropriate authorization
router.use(checkAccess);

router.post("/add", customerCtrl.add);
router.patch("/modify", customerCtrl.modify);
router.delete("/del", customerCtrl.delete);

module.exports = router;
