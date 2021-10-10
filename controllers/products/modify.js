const Product = require("../../models/product");
const Variant = require("../../models/variant");

const modifyProducts = async (req, res) => {
  const { body: data } = req;

  const populatedAddedByFilter = {
    username: 0,
    password: 0,
  };

  try {
    const isExist = await Product.exists({ _id: data._id });

    if (!isExist)
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

    for (const variant of data.variants) {
      const isExist = await Variant.exists({ _id: variant._id });

      if (!isExist)
        return res.status(404).json({
          message: `Variant with ID "${variant._id}" does not exist. Please add the variant first.`,
          success: false,
        });

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

    console.log(updatedProduct);

    res.status(200).json({
      success: true,
      message: "Product updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error,
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