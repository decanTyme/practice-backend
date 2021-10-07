const express = require("express");
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
router.get("/", load);
router.post("/add", add);
router.patch("/modify", modifyProduct);
router.delete("/del", remove);

module.exports = router;
