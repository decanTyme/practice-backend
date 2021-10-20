const Brand = require("../../models/brand");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const modifyBrands = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    const isExist = await Brand.exists({ _id: data._id });

    if (!isExist)
      return res.status(200).json({
        message: `Brand "${data.name}" does not exist. Please add the brand first.`,
        success: false,
      });

    await Brand.findByIdAndUpdate(data._id, data, {
      runValidators: true,
      context: "query",
    });

    const updatedBrand = await Brand.findById(data._id)
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

    const savedActivity = await new Activity({
      mode: "update",
      path: req.originalUrl,
      record: updatedBrand._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    res.status(200).json({
      brand: updatedBrand,
      activityRecord: savedActivity,
      success: true,
      message: `Successfully updated the brand "${updatedBrand.name}".`,
    });
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

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        activityRecord: savedActivity,
        message: "There was an error in fetching the brands.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      activityRecord: savedActivity,
      message: "There was an error in fetching the brands.",
    });
  }
};

module.exports = modifyBrands;
