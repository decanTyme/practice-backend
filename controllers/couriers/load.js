const Courier = require("../../models/courier");

const loadCouriers = async (req, res) => {
  const { query: queries, body } = req;

  try {
    const couriers = await Courier.find();

    res.status(200).json(couriers);
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

module.exports = loadCouriers;
