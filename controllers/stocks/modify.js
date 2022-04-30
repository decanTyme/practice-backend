const Stock = require("../../models/stock");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const modifyStocks = async (req, res) => {
  const {
    user: { sub: adminId },
    body: data,
  } = req;

  try {
    const isExist = await Stock.exists({ _id: data._id });

    if (!isExist)
      return res.status(404).json({
        message: `Stock with batch no. "${data.batch}" does not exist. Please add the stock first.`,
        success: false,
      });

    await Stock.findByIdAndUpdate(data._id, data, {
      runValidators: true,
      context: "query",
    });

    const updatedStock = await Stock.findById(data._id)
      .select({ createdAt: 0, updatedAt: 0 })
      .populate({
        path: "courier",
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

    const savedActivity = await new Activity({
      mode: "update",
      path: req.originalUrl,
      record: updatedStock._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    res.status(200).json({
      stock: updatedStock,
      activityRecord: savedActivity,
      success: true,
      message: `Stock with batch no. ${updatedStock.batch} updated successfully.`,
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

  // if (updatedProduct.n === 0)
  //   return res.status(400).json({
  //     success: false,
  //     message: `There was product with ID: ${req.body._id}`,
  //   });

  // if (updatedProduct.nModified === 0)
  //   return res.status(400).json({
  //     success: false,
  //     message: "No products were modified.",
  //   });
};

module.exports = modifyStocks;
