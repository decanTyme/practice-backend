const Product = require("../../models/product");
const Variant = require("../../models/variant");
const Stock = require("../../models/stock");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

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

    const product = await Product.findById(queries._id);

    if (!product)
      return res.status(404).json({
        message: `Product with ID "${queries._id}" does not exist.`,
        success: false,
      });

    await product.execPopulate({ path: "brand" });

    const variants = await Variant.find({ product: queries._id });

    let deletedStockCount = 0;
    for (const variant of variants) {
      deletedStockCount += (await Stock.deleteMany({ variant: variant._id }))
        .deletedCount;
    }

    const deletedVariants = await Variant.deleteMany({ product: queries._id });
    const deletedProduct = await Product.findByIdAndDelete(queries._id);

    const savedActivity = await new Activity({
      mode: "delete",
      path: req.originalUrl,
      record: deletedProduct._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    return res.status(200).json({
      deleted: deletedProduct,
      deleteCounts: {
        variant: deletedVariants.deletedCount,
        stocks: deletedStockCount,
      },
      activityRecord: savedActivity,
      success: true,
      message: `Successfully removed the product "${product.brand.name} ${product.name}".`,
    });
  } catch (error) {
    console.log("Error", error);

    const savedActivity = await new Activity({
      mode: "delete",
      path: req.originalUrl,
      user: adminId,
      reason: error.message,
      status: "fail",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    if (error instanceof TypeError)
      return res.status(500).json({
        error: JSON.stringify(error),
        activityRecord: savedActivity,
        message: "There was an error in saving the product.",
      });

    // if (error instanceof CastError)
    //   return res.status(500).json({
    //     error: `${error.name}: ${error.message}`,
    //     message: "There was an error in adding the stock to the product.",
    //   });

    return res.status(500).json({
      error: JSON.stringify(error),
      activityRecord: savedActivity,
      message: "There was an error in saving the product.",
    });
  }
};

module.exports = removeProducts;
