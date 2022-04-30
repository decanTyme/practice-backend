const Brand = require("../../models/brand");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const removeBrands = async (req, res) => {
  const {
    user: { sub: adminId },
    query: queries,
  } = req;

  console.log(req.path, queries);
  try {
    if (!queries._id)
      return res.status(400).json({
        success: false,
        message: "No stock ID was given.",
      });

    const brand = await Brand.findById(queries._id);

    if (!brand)
      return res.status(404).json({
        message: `Brand with ID "${queries._id}" does not exist.`,
        success: false,
      });

    await Brand.deleteOne({ _id: queries._id });

    const savedActivity = await new Activity({
      mode: "delete",
      path: req.originalUrl,
      record: queries._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    return res.status(200).json({
      activityRecord: savedActivity,
      message: `Brand "${brand.name}" successfully deleted.`,
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
      activityRecord: savedActivity,
      message: "There was an error in saving the stock.",
    });
  }
};

module.exports = removeBrands;
