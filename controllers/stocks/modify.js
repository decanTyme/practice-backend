const Stock = require("../../models/stock");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const modifyStocks = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    if (queries.check) {
      if (!queries._id)
        return res.status(400).json({
          success: false,
          message: "No stock ID was given.",
        });

      const stock = await Stock.findById(queries._id);

      if (!stock)
        return res.status(404).json({
          message: `Stock with ID "${queries._id}" does not exist.`,
          success: false,
        });

      if (stock.checked === queries.mark)
        return res.status(200).json({
          message: `Stock with ID "${queries._id}" is already marked as ${queries.mark}.`,
          success: false,
        });

      const prevMark = stock.checked;

      stock.checked = queries.mark;
      stock.updatedBy.push({ user: adminId });

      await stock.save();

      const savedActivity = await new Activity({
        mode: "update",
        path: req.originalUrl,
        record: stock._id,
        reason: `Stock marked from ${prevMark} to ${queries.mark}.`,
        user: adminId,
        status: "success",
        date: new Date().toISOString(),
      }).save();

      await stock.execPopulate({
        path: "addedBy",
        populate: { path: "user", select: populatedAddedByFilter },
      });

      await stock.execPopulate({
        path: "updatedBy",
        populate: { path: "user", select: populatedAddedByFilter },
      });

      await stock.execPopulate("courier");

      return res.status(200).json({
        stock,
        activityRecord: savedActivity,
        message: `Stock with the batch no. "${stock.batch}" successfully marked as ${queries.mark}.`,
        success: true,
      });
    }
  } catch (error) {
    console.log("Error", error);

    const savedActivity = await new Activity({
      mode: "update",
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
      error: JSON.stringify(error) || error.message,
      activityRecord: savedActivity,
      message: "There was an error in saving the stock.",
    });
  }
};

module.exports = modifyStocks;
