const Courier = require("../../models/courier");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const addCouriers = async (req, res) => {
  const {
    user: { sub: adminId },
    body: data,
  } = req;

  try {
    const isExist = await Courier.exists({
      name: data.name,
    });

    if (isExist)
      return res.status(200).json({
        message: `Courier "${data.name}" already exists.`,
        success: false,
      });

    const savedCourier = await new Courier({
      ...data,
      addedBy: adminId,
    }).save();

    const savedActivity = await new Activity({
      mode: "add",
      path: req.originalUrl,
      record: savedCourier._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedCourier.execPopulate({
      path: "addedBy",
      select: { createdAt: 0, updatedAt: 0 },
      populate: { path: "user", select: populatedAddedByFilter },
    });

    await savedCourier.execPopulate({
      path: "updatedBy",
      select: { createdAt: 0, updatedAt: 0 },
      populate: { path: "user", select: populatedAddedByFilter },
    });

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    return res.status(200).json({
      courier: savedCourier,
      activityRecord: savedActivity,
      message: `Successfully saved courier "${savedCourier.name}".`,
      success: true,
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

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    if (error instanceof TypeError)
      return res.status(500).json({
        error: `${error.name}: ${error.message}`,
        activityRecord: savedActivity,
        message: "There was an error in saving the courier.",
      });

    return res.status(500).json({
      error: `${error.name}: ${error.message}`,
      activityRecord: savedActivity,
      message: "There was an error in fetching the courier.",
    });
  }
};

module.exports = addCouriers;
