const Stock = require("../../models/stock");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const moveStocks = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  console.log(req.path, queries, data);
  try {
    if (!queries._id)
      return res.status(400).json({
        success: false,
        message: "No stock ID was given.",
      });

    if (!queries._type)
      return res.status(400).json({
        success: false,
        message: "No move location indicated.",
      });

    const stock = await Stock.findById(queries._id);

    if (!stock)
      return res.status(404).json({
        message: `Stock with ID "${queries._id}" does not exist.`,
        success: false,
      });

    if (stock._type === queries._type)
      return res.status(200).json({
        message: `Stock with batch no. "${stock.batch}" is already in ${queries._type}.`,
        success: false,
      });

    // If it was moved from inbound to warehouse, it means the stock has
    // arrived, hence auto append an arrival date
    if (stock._type === "inbound" && queries._type === "warehouse")
      stock.arrivedOn = new Date().toISOString();

    // The stock should also be already inventory checked if moved from
    // warehouse to sold
    if (stock._type === "warehouse" && queries._type === "sold")
      stock.checked = true;

    const prevType = stock._type;

    stock._type = queries._type;

    const movedStock = await stock.save();

    const savedActivity = await new Activity({
      mode: "update",
      path: req.originalUrl,
      record: movedStock._id,
      reason: `Move stock from "${prevType}" to "${queries._type}".`,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await movedStock.execPopulate({
      path: "addedBy",
      populate: { path: "user", select: populatedAddedByFilter },
    });

    await movedStock.execPopulate({
      path: "updatedBy",
      populate: { path: "user", select: populatedAddedByFilter },
    });

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    return res.status(200).json({
      moved: movedStock,
      activityRecord: savedActivity,
      success: true,
      message: `Stock with the batch no. "${stock.batch}" successfully moved to ${queries._type}.`,
    });
  } catch (error) {
    console.log(req.originalUrl, "Error", error);

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
      error: JSON.stringify(error) || error.message,
      message: "There was an error in saving the stock.",
    });
  }
};

module.exports = moveStocks;
