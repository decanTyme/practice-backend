const express = require("express");
const { load, add, modify, remove } = require("../../controllers/products");
const checkAccess = require("../../services/check-access");
const variantRoutes = require("./variants");

const router = express.Router({ strict: true, mergeParams: true });

// Item management routes
router.get("/", load);

router.get("/:productId", load);

router.use(
  "/:productId/variants",
  (req, _, next) => {
    req.productId = req.params.productId;
    next();
  },
  variantRoutes
);

// Require appropriate authorization
router.use(checkAccess);

router.post("/add", add);
router.patch("/modify", modify);
router.delete("/del", remove);

module.exports = router;
