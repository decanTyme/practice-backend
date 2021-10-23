const Product = require("../../../models/product");
const Variant = require("../../../models/variant");
const Activity = require("../../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const addVariant = async (req, res) => {
  const {
    user: { sub: adminId },
    query: queries,
    params,
    body: data,
    productId,
  } = req;

  if (!productId)
    return res.status(400).json({
      success: false,
      message: "No product ID was given.",
    });

  try {
    const product = await Product.findOne({ _id: productId });

    if (!product)
      return res.status(404).json({
        message: `Product with ID "${productId}" does not exist.`,
        success: false,
      });

    const isExist = await Variant.exists({
      product: productId,
      name: data.name,
    });

    if (isExist)
      return res.status(200).json({
        message: `Variant "${data.name}" already exists on product "${product.brand} ${product.name}".`,
        success: false,
      });

    const savedVariant = await new Variant({
      ...data,
      product: productId,
    }).save();

    const savedActivity = await new Activity({
      mode: "add",
      path: req.originalUrl,
      record: savedVariant._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    return res.status(201).json({
      variant: savedVariant,
      activityRecord: savedActivity,
      message: `Successfully created the variant "${data.name}" on "${product.name}".`,
      success: true,
    });
  } catch (error) {
    console.log("Error", error);

    const savedActivity = await new Activity({
      mode: "add",
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

module.exports = addVariant;
