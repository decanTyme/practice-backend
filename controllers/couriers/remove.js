const Courier = require("../../models/courier");
const Activity = require("../../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

const removeCouriers = async (req, res) => {
  const {
    user: { sub: adminId },
    query: queries,
    body: data,
  } = req;

  console.log(req.path, queries);
  try {
    if (!queries._id)
      return res.status(400).json({
        success: false,
        message: "No courier ID was given.",
      });

    const courier = await Courier.findById(queries._id);

    if (!courier)
      return res.status(404).json({
        message: `Courier with ID "${queries._id}" does not exist.`,
        success: false,
      });

    await Courier.deleteOne({ _id: queries._id });

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
      message: `Courier "${courier.name}" successfully deleted.`,
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

module.exports = removeCouriers;