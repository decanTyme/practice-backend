const express = require("express");
const itemRoutes = require("./items");
const customerRoutes = require("./customers");
const courierRoutes = require("./couriers");
const brandRoutes = require("./brands");

const router = express.Router();

// Item management routes
router.use("/", itemRoutes);
router.use("/customers", customerRoutes);
router.use("/couriers", courierRoutes);
router.use("/brands", brandRoutes);

module.exports = router;
