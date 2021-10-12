const Product = require("../../../models/product");
const Variant = require("../../../models/variant");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const loadProductVariants = async (req, res) => {
  const { productId } = req;

  if (!productId)
    return res.status(400).json({
      success: false,
      message: "No product id was given.",
    });

  try {
    const product = await Product.findById(productId);

    if (!product)
      return res.status(404).json({
        message: `Product with ID "${productId}" does not exist.`,
        success: false,
      });

    const variants = await Variant.find({ product: productId })
      .populate({
        path: "addedBy",
        select: { createdAt: 0, updatedAt: 0 },
        populate: { path: "user", select: populatedAddedByFilter },
      })
      .populate({
        path: "stocks",
        populate: {
          path: "addedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        },
      })
      .populate({
        path: "stocks",
        select: { createdAt: 0, updatedAt: 0 },
        populate: { path: "courier" },
      });

    res.status(200).json(variants);
  } catch (error) {
    return res.status(500).json({
      error: JSON.stringify(error),
      message: "There was an error in fetching the product variants.",
    });
  }
};

module.exports = loadProductVariants;
