const Product = require("../../models/product");
const Variant = require("../../models/variant");
const Stock = require("../../models/stock");

const removeProducts = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
  } = req;

  try {
    if (!queries._id)
      return res.status(400).json({
        success: false,
        message: "No product id was given.",
      });

    const isExist = await Product.exists({ _id: queries._id });

    if (!isExist)
      return res.status(404).json({
        message: `Product with ID "${queries._id}" does not exist.`,
        success: false,
      });

    const variants = await Variant.find({ product: queries._id });

    let deletedStockCount = 0;
    for (const variant of variants) {
      deletedStockCount += (await Stock.deleteMany({ variant: variant._id }))
        .deletedCount;
    }

    const deletedVariants = await Variant.deleteMany({ product: queries._id });
    const deletedProduct = await Product.findByIdAndDelete(queries._id);

    return res.status(200).json({
      deleted: deletedProduct,
      deleteCounts: {
        variant: deletedVariants.deletedCount,
        stocks: deletedStockCount,
      },
      success: true,
      message: `Successfully removed the product "${deletedProduct.brand} ${deletedProduct.name}".`,
    });
  } catch (error) {
    console.log("Error", error);

    if (error instanceof TypeError)
      return res.status(500).json({
        error: JSON.stringify(error),
        message: "There was an error in saving the product.",
      });

    // if (error instanceof CastError)
    //   return res.status(500).json({
    //     error: `${error.name}: ${error.message}`,
    //     message: "There was an error in adding the stock to the product.",
    //   });

    return res.status(500).json({
      error: JSON.stringify(error),
      message: "There was an error in saving the product.",
    });
  }
};

module.exports = removeProducts;
