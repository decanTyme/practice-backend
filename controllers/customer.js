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
    const customers = await Customer.find();

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      error: error,
      message: generateErrorMsg(queries.type),
    });
  }
};

exports.add = async (req, res) => {
  const queries = req.query;
  const body = req.body;

  const customer = new Customer(body);

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
