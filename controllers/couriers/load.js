const Courier = require("../../models/courier");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const loadCouriers = async (req, res) => {
  try {
    const couriers = await Courier.find()
      .select({ createdAt: 0, updatedAt: 0 })
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
