const Brand = require("../../models/brand");
const Activity = require("../../models/activity");

const addBrands = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    const isExist = await Brand.exists({ name: data.name });

    if (isExist)
      return res.status(200).json({
        message: `Brand "${data.name}" already exists.`,
        success: false,
      });

    const savedBrand = await new Brand(data).save();

    const savedActivity = await new Activity({
      mode: "add",
      path: req.originalUrl,
      record: savedBrand._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    res.status(200).json({
      brand: savedBrand,
      activityRecord: savedActivity,
      success: true,
      message: `Successfully added the brand "${savedBrand.name}".`,
    });
  } catch (error) {
    console.log("Error", error);

    const savedActivity = await new Activity({
      mode: "add",
      path: req.originalUrl,
      reason: error.message,
      user: adminId,
      status: "fail",
      date: new Date().toISOString(),
    }).save();

    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        activityRecord: savedActivity,
        message: "There was an error in fetching the brands.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      message: "There was an error in fetching the brands.",
    });
  }
};

module.exports = addBrands;
