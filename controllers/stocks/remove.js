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

    return res.status(200).json({
      message: `Stock with the batch no. "${stock.batch}" successfully deleted.`,
      success: true,
    });
  } catch (error) {
    console.log("Error", error);

    if (error instanceof TypeError)
      return res.status(500).json({
        error: JSON.stringify(error),
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
