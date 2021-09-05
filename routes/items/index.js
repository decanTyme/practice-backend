const express = require("express");
const productRoutes = require("./products");
const stockRoutes = require("./stocks");

const router = express.Router();

// Item management routes
router.use("/products", productRoutes);
router.use("/stocks", stockRoutes);
// router.use("/modify");
// router.use("/del");

module.exports = router;
