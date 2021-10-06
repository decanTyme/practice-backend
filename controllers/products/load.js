const Product = require("../../models/product");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const loadProducts = async (req, res) => {
  const { query: queries } = req;

  console.log(queries);
  try {
    if (queries.populate !== "none") {
      const products = await Product.find()
        .populate("addedBy", populatedAddedByFilter)
        .populate({
          path: "variants",
          populate: {
            path: "stocks",
            populate: { path: "addedBy", select: populatedAddedByFilter },
          },
        })
        .populate({
          path: "variants",
          populate: { path: "addedBy", select: populatedAddedByFilter },
        });

      return res.status(200).json(products);
    }

    const products = await Product.find();

    return res.status(200).json(products);
  } catch (error) {
    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        message: "There was an error in saving the product.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      message: "There was an error in fetching the products.",
    });
  }
};

module.exports = loadProducts;
