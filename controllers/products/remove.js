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
    user: { sub: adminId },
    query: queries,
  } = req;

  console.log(queries);
  // return;
  try {
    if (!queries._id)
      return res.status(400).json({
        success: false,
        message: "No product ID was given.",
      });

    // Batch deletion
    if (queries.batch || Array.isArray(queries._id)) {
      const deletedProducts = [];
      const nonExistentProducts = [];
      let allDeletedVariants = 0;
      let allDeletedStockCount = 0;

      for (const itemId of queries._id) {
        const product = await Product.findById(itemId);

        // If a product already exist, add it to the existing products
        // array and do not perform a save
        if (!product) {
          nonExistentProducts.push(itemId);

          continue;
        }

        await product.execPopulate({ path: "brand" });

        const variants = await Variant.find({ product: itemId });

        for (const variant of variants) {
          allDeletedStockCount += (
            await Stock.deleteMany({ variant: variant._id })
          ).deletedCount;
        }

        const deletedVariants = await Variant.deleteMany({ product: itemId });
        await Product.findByIdAndDelete(itemId);

        allDeletedVariants += deletedVariants.deletedCount;
        deletedProducts.push(product);
      }

      if (deletedProducts.length === 0)
        return res.status(200).json({
          existing: nonExistentProducts,
          success: false,
          message: "No products were deleted.",
        });

      const savedActivity = await new Activity({
        mode: "delete",
        path: req.originalUrl,
        record: deletedProducts.map(({ _id }) => _id),
        user: adminId,
        status: "success",
        date: new Date().toISOString(),
      }).save();

      await savedActivity.execPopulate({
        path: "user",
        select: populatedAddedByFilter,
      });

      if (nonExistentProducts.length !== 0)
        return res.status(201).json({
          deleted: deletedProducts,
          nonExistent: nonExistentProducts,
          activityRecord: savedActivity,
          success: true,
          message: "Some products were not deleted because they do not exist.",
        });

      return res.status(200).json({
        deleted: deletedProducts,
        deleteCounts: {
          variants: allDeletedVariants,
          stocks: allDeletedStockCount,
        },
        activityRecord: savedActivity,
        success: true,
        message: `Successfully removed all the following products: ${deletedProducts
          .map(({ brand, name }) => `${brand.name} ${name}`)
          .join(", ")}`,
      });
    }

    // Single deletion
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
