const mongoose = require("mongoose");
const Customer = require("../models/customer");
const Activity = require("../models/activity");

const populatedAddedByFilter = {
  username: 0,
  password: 0,
};

class NotModifiedError extends Error {
  constructor(message = "No items were modified.") {
    super(message);
    this.name = "NotModifiedError";
    this.message = message;
  }
}

const generateErrorMsg = (type) =>
  `There was an error in loading the ${type} data. Please try again later.`;

exports.load = async (req, res) => {
  const queries = req.query;
  const body = req.body;

  try {
    if (queries.populate === "none") {
      const customers = await Customer.find({})
        .populate({
          path: "addedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        })
        .populate({
          path: "updatedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        })
        .populate({
          path: "deletedBy",
          select: { createdAt: 0, updatedAt: 0 },
          populate: { path: "user", select: populatedAddedByFilter },
        })
        .populate("transactions");

      return res.status(200).json(customers);
    }

    const customers = await Customer.find();

    return res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      error: JSON.stringify(error),
      message: generateErrorMsg(queries.type),
    });
  }
};

exports.add = async (req, res) => {
  const {
    user: { id: adminId },
    query: queries,
    body: data,
  } = req;

  try {
    const isExist = await Customer.exists({
      firstname: data.firstname,
      lastname: data.lastname,
    });

    if (isExist)
      return res.status(200).json({
        message: `Customer "${data.firstname} ${data.lastname}" already exists.`,
        success: false,
      });

    const savedCustomer = await new Customer({
      ...data,
      addedBy: adminId,
    }).save();

    const savedActivity = await new Activity({
      mode: "add",
      record: savedCustomer._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    res.status(200).json({
      customer: savedCustomer,
      activityRecord: savedActivity,
      success: true,
      message: "Successfully added the customer.",
    });
  } catch (error) {
    const savedActivity = await new Activity({
      mode: "add",
      user: adminId,
      reason: error.message,
      status: "fail",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    res.status(500).json({
      error: JSON.stringify(error),
      activityRecord: savedActivity,
      message: generateErrorMsg(queries.type),
    });
  }
};

exports.modify = async (req, res) => {
  const body = req.body;
  const _id = body._id;

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(_id, body, {
      new: true,
      runValidators: true,
    });

    if (!updatedCustomer)
      throw new NotModifiedError(`No customer with ID ${_id} found.`);

    const savedActivity = await new Activity({
      mode: "update",
      record: updatedCustomer._id,
      user: adminId,
      status: "success",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    res.status(200).json({
      customer: updatedCustomer,
      activityRecord: savedActivity,
      message: "Successfully updated the customer details.",
      success: true,
    });
  } catch (error) {
    console.log(error);

    const savedActivity = await new Activity({
      mode: "update",
      user: adminId,
      reason: error.message,
      status: "fail",
      date: new Date().toISOString(),
    }).save();

    await savedActivity.execPopulate({
      path: "user",
      select: populatedAddedByFilter,
    });

    if (error instanceof NotModifiedError)
      return res.status(500).json({ success: false, message: error.message });

    res.status(500).json({
      error: JSON.stringify(error),
      activityRecord: savedActivity,
      message: generateErrorMsg(queries.type),
    });
  }
};

exports.delete = (req, res) => {};
