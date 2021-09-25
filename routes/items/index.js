const express = require("express");
const productRoutes = require("./products");
const authenticateToken = require("../../services/authenticate-token");

const router = express.Router();

// Item management routes
router.use("/stocks", productRoutes);
// router.use("/orders");
// router.use("/modify");
// router.use("/del");

module.exports = router;
