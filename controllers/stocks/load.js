const Stock = require("../../models/stock");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const loadStocks = async (req, res) => {
  const { queries, body } = req;

  try {
    const stocks = await Stock.find()
      .populate("courier")
      .populate("addedBy", populatedAddedByFilter);

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
