const express = require("express");
const authenticateToken = require("../../services/authenticate-token");
const {
  load,
  add,
  modifyProduct,
  remove,
} = require("../../controllers/products");
const variantRoutes = require("./variants");

const router = express.Router();

router.use("/variants", variantRoutes);

// Item management routes
router.get("/", authenticateToken, load);
router.post("/add", authenticateToken, add);
router.patch("/modify", authenticateToken, modifyProduct);
router.delete("/del", authenticateToken, remove);

module.exports = router;
