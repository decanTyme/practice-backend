const Product = require("../../models/product");
const Variant = require("../../models/variant");
const Stock = require("../../models/stock");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const addStocks = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    if (!queries._id)
      return res.status(400).json({
        success: false,
        message: "No variant id was given.",
      });

    const variant = await Variant.findOne({ _id: queries._id });

    if (!variant)
      return res.status(404).json({
        message: `Variant with ID "${queries._id}" does not exist.`,
        success: false,
      });

    const isExist = await Stock.exists({ batch: data.batch });

    if (isExist)
      return res.status(200).json({
        message: `The stock with batch no. ${data.batch} already exists. Update the stock directly instead.`,
        exists: true,
        success: false,
      });

    // Push the new stock data
    const savedStock = await new Stock({
      ...data,
      variant: queries._id,
      _type: queries._type,
    }).save();

    const product = await Product.findOne({ _id: variant.product });

    const savedActivity = await new Activity({
      mode: "add",
      path: req.originalUrl,
      record: savedStock._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedStock.execPopulate("addedBy", populatedAddedByFilter);
    await savedStock.execPopulate("courier");

    return res.status(201).json({
      stock: savedStock,
      activityRecord: savedActivity,
      success: true,
      message: `New inbound stock added to "${product.brand} ${product.name}" with the batch no. "${data.batch}" in variant "${variant.name}".`,
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
      message: "There was an error in saving the stock.",
    });
  }
};

module.exports = addStocks;
