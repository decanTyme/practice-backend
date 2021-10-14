const Product = require("../../models/product");
const Variant = require("../../models/variant");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const modifyProducts = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    const product = await Product.findById({ _id: data._id });

    await product.execPopulate("variants");

    if (!product)
      return res.status(404).json({
        message: `Product "${data.brand} ${data.name}" does not exist. Please add the product first.`,
        success: false,
      });

    await Product.findByIdAndUpdate(data._id, data, {
      runValidators: true,
    });

    if (!data.variants || data.variants.length === 0)
      return res.status(404).json({
        message: `Please provide at least one product variant.`,
        success: false,
      });

    console.log({
      productVars: product.variants.length,
      dataVars: data.variants.length,
    });

    const removedVariants = [];
    if (product.variants.length > data.variants.length) {
      const diff = product.variants.filter(
        (variant) => !data.variants.find((vari) => vari.name === variant.name)
      );

      diff.forEach(async ({ _id }) => {
        const remV = await Variant.findByIdAndDelete(_id);
        removedVariants.push(remV);
      });
    }

    const newVariants = [];
    for (const variant of data.variants) {
      const isExist = await Variant.exists({ _id: variant._id });

      if (!isExist) {
        const newVariant = await new Variant({
          ...variant,
          product: data._id,
        }).save();
        newVariants.push(newVariant);
        continue;
      }

      await Variant.findByIdAndUpdate(variant._id, variant, {
        runValidators: true,
      });
    }

    const updatedProduct = await Product.findById(data._id)
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
        populate: {
          path: "stocks",
          populate: { path: "courier" },
        },
      })
      .populate({
        path: "variants",
        populate: { path: "addedBy", select: populatedAddedByFilter },
      });

    await updatedProduct.execPopulate({
      path: "brand",
      select: { name: 1 },
    });

    const savedActivity = await new Activity({
      mode: "update",
      path: req.originalUrl,
      record: [
        updatedProduct._id,
        ...newVariants.map(({ _id }) => _id),
        ...removedVariants.map(({ _id }) => _id),
      ],
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    res.status(200).json({
      product: updatedProduct,
      activityRecord: savedActivity,
      success: true,
      message: "Product updated successfully.",
    });
  } catch (error) {
    console.log(error);

    const savedActivity = await new Activity({
      mode: "update",
      path: req.originalUrl,
      reason: error.message,
      user: adminId,
      status: "fail",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    return res.status(500).json({
      error,
      activityRecord: savedActivity,
      message: "There was an error in updating the product.",
    });
  }

  // if (updatedProduct.n === 0)
  //   return res.status(400).json({
  //     success: false,
  //     message: `There was product with id: ${req.body._id}`,
  //   });

  // if (updatedProduct.nModified === 0)
  //   return res.status(400).json({
  //     success: false,
  //     message: "No products were modified.",
  //   });
};

module.exports = modifyProducts;
