const Product = require("../../models/product");
const Variant = require("../../models/variant");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const modifyProducts = async (req, res) => {
  const {
    user: { sub: adminId },
    body: data,
  } = req;

  try {
    const product = await Product.findById(data._id);

    if (!product)
      return res.status(404).json({
        message: `Product "${data.brand} ${data.name}" does not exist. 
                  Please add the product first.`,
        success: false,
      });

    await Product.findByIdAndUpdate(data._id, data, {
      runValidators: true,
      context: "query",
    });

    if (!data.variants || data.variants.length === 0)
      return res.status(404).json({
        message: `Please provide at least one product variant.`,
        success: false,
      });

    await product.execPopulate("variants");

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
        context: "query",
      });
    }

    const updatedProduct = await Product.findById(data._id)
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
      message: `Product "${updatedProduct.brand.name} ${updatedProduct.name}" updated successfully.`,
    });
  } catch (error) {
    console.log(error);

    const savedActivity = await new Activity({
      mode: "update",
      record: data._id,
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
};

module.exports = modifyProducts;
