const mongoose = require("mongoose");
const Customer = require("../models/customer");

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
    if (queries.populate) {
      const customers = await Customer.find().populate("addedBy", {
        username: 0,
        password: 0,
      });

      return res.status(200).json(customers);
    }

    const customers = await Customer.find();

    return res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      error: error,
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

  const isExist = await Customer.exists({
    firstname: data.firstname,
    lastname: data.lastname,
  });

  if (isExist)
    return res.status(200).json({
      message: `Customer "${data.firstname} ${data.lastname}" already exists.`,
      success: false,
    });

  const customer = new Customer({
    ...data,
    addedBy: adminId,
  });

  try {
    await customer.save();

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      error: error,
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

    res.status(200).json({
      customer: updatedCustomer,
      success: true,
      message: "Successfully updated the customer details.",
    });
  } catch (error) {
    console.log(error);

    if (error instanceof NotModifiedError)
      return res.status(500).json({ success: false, message: error.message });

    res.status(500).json(error);
  }
};

exports.delete = (req, res) => {};
