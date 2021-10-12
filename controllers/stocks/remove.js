const Stock = require("../../models/stock");

const removeStocks = async (req, res) => {
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

    const stock = await Stock.findById(queries._id);

    if (!stock)
      return res.status(404).json({
        message: `Stock with ID "${queries._id}" does not exist.`,
        success: false,
      });

    await Stock.deleteOne({ _id: queries._id });

    const savedActivity = await new Activity({
      mode: "delete",
      path: req.originalUrl,
      record: queries._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    return res.status(200).json({
      activityRecord: savedActivity,
      message: `Stock with the batch no. "${stock.batch}" successfully deleted.`,
      success: true,
    });
  } catch (error) {
    console.log("Error", error);

    const savedActivity = await new Activity({
      mode: "delete",
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
      message: "There was an error in saving the stock.",
    });
  }
};

module.exports = removeStocks;
