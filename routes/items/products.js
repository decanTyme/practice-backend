const express = require("express");
const { load, add, modify, remove } = require("../../controllers/products");
const checkAccess = require("../../services/access-check");
const variantRoutes = require("./variants");

const router = express.Router({ strict: true, mergeParams: true });

// Item management routes
router.get("/", load);
router.post("/add", checkAccess, add);
router.patch("/modify", checkAccess, modify);
router.delete("/del", checkAccess, remove);

router.get("/:productId", load);

router.use(
  "/:productId/variants",
  (req, _, next) => {
    req.productId = req.params.productId;
    next();
  },
  variantRoutes
);

module.exports = router;
