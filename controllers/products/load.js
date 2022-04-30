const Product = require("../../models/product");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const loadProducts = async (req, res) => {
  const {
    query: queries,
    params: { productId },
  } = req;

  try {
    if (productId) {
      const isExist = await Product.exists({ _id: productId });

      if (!isExist)
        return res.status(404).json({
          message: `Product with ID "${productId}" does not exist. 
                    Please add the variant first.`,
          success: false,
        });

      const product = await Product.findById(productId)
        .select({ createdAt: 0, updatedAt: 0 })
        .populate({ path: "brand", select: { name: 1 } })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "stocks",
            select: { createdAt: 0, updatedAt: 0 },
            populate: {
              path: "addedBy",
              select: { createdAt: 0, updatedAt: 0 },
              populate: { path: "user", select: populatedAddedByFilter },
            },
          },
        })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "prices",
            select: { createdAt: 0, updatedAt: 0 },
          },
        })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "stocks",
            select: { createdAt: 0, updatedAt: 0 },
            populate: {
              path: "courier",
              select: { createdAt: 0, updatedAt: 0 },
            },
          },
        })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "addedBy",
            select: { createdAt: 0, updatedAt: 0 },
            populate: { path: "user", select: populatedAddedByFilter },
          },
        })
        .populate({
          path: "addedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        })
        .populate({
          path: "updatedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        });

      return res.status(200).json(product);
    }
  } catch (error) {
    return res.status(500).json({
      error: JSON.stringify(error),
      message: "There was an error in fetching the product.",
    });
  }

  try {
    if (queries.populate !== "none") {
      const products = await Product.find()
        .select({ createdAt: 0, updatedAt: 0 })
        .populate({ path: "brand", select: { name: 1 } })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "stocks",
            select: { createdAt: 0, updatedAt: 0 },
            populate: {
              path: "addedBy",
              select: { createdAt: 0, updatedAt: 0 },
              populate: { path: "user", select: populatedAddedByFilter },
            },
          },
        })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "prices",
            select: { createdAt: 0, updatedAt: 0 },
          },
        })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "stocks",
            select: { createdAt: 0, updatedAt: 0 },
            populate: {
              path: "courier",
              select: { createdAt: 0, updatedAt: 0 },
            },
          },
        })
        .populate({
          path: "variants",
          select: { createdAt: 0, updatedAt: 0 },
          populate: {
            path: "addedBy",
            select: { createdAt: 0, updatedAt: 0 },
            populate: { path: "user", select: populatedAddedByFilter },
          },
        })
        .populate({
          path: "addedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        })
        .populate({
          path: "updatedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        });

      return res.status(200).json(products);
    }

    const products = await Product.find();

    return res.status(200).json(products);
  } catch (error) {
    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        message: "There was an error in fetching the product.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      message: "There was an error in fetching the products.",
    });
  }
};

module.exports = loadProducts;
