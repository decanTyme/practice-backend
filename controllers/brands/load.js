const Brand = require("../../models/brand");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const loadBrands = async (req, res) => {
  try {
    const brands = await Brand.find()
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

    res.status(200).json(brands);
  } catch (error) {
    console.log("Error", error);

    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        message: "There was an error in fetching the brands.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      message: "There was an error in fetching the brands.",
    });
  }
};

module.exports = loadBrands;
