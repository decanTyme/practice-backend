const Courier = require("../../models/courier");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const modifyCouriers = async (req, res) => {
  const {
    user: { sub: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    const isExist = await Courier.exists({ _id: data._id });

    if (!isExist)
      return res.status(200).json({
        message: `Courier "${data.name}" does not exist. Please add the courier first.`,
        success: false,
      });

    await Courier.findByIdAndUpdate(data._id, data, {
      runValidators: true,
      context: "query",
    });

    const updatedCourier = await Courier.findById(data._id)
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
      record: updatedCourier._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    res.status(200).json({
      courier: updatedCourier,
      activityRecord: savedActivity,
      success: true,
      message: `Successfully updated the courier "${updatedCourier.name}".`,
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

module.exports = modifyCouriers;
