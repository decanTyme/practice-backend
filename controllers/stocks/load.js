const Stock = require("../../models/stock");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const loadStocks = async (req, res) => {
  const { queries, body } = req;

  try {
    const stocks = await Stock.find()
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

    return res.status(200).json(stocks);
  } catch (error) {
    console.log("Error", error);

    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        message: "There was an error in saving the stock.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      message: "There was an error in fetching the stock.",
    });
  }
};

module.exports = loadStocks;
