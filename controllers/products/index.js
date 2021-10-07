const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

// Mongoose model imports
const Product = require("../../models/product");
const Event = require("../../models/events");
const Order = require("../../models/order");
const loadProducts = require("./load");
const addProducts = require("./add");
const removeProducts = require("./remove");

const ITEM_PRODUCT = "product";
const ITEM_CUSTOMER = "customer";
const ITEM_ORDER = "order";

exports.load = loadProducts;

exports.add = addProducts;

exports.modifyProduct = async (req, res) => {
  const { access, body: data } = req;

  if (!access)
    return res.status(403).json({
      success: false,
      message: "Sorry, you don't have enough priviliges to do that.",
    });

  const isExist = await Product.exists({
    name: data.name,
    brand: data.brand,
  });

  if (!isExist)
    return res.status(404).json({
      message: `Product "${data.brand} ${data.name}" does not exist. Please add the product first.`,
      success: false,
    });

  const productId = data._id;

  try {
    return Product.findByIdAndUpdate(
      productId,
      data,
      {
        new: true,
        runValidators: true,
        upsert: true,
      },
      (err, updatedProduct) => {
        if (err) throw Error(err);

        res.status(200).json({
          success: true,
          message: "Product updated successfully.",
          product: updatedProduct,
        });
      }
    );

    return res.status(403).json({
      success: false,
      message: "Sorry, you don't have enough priviliges to do that.",
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      error,
      message: "There was an error in updating the product.",
    });
  }

  // if (updatedProduct.n === 0)
  //   return res.status(400).json({
  //     success: false,
  //     message: `There was product with id: ${req.body._id}`,
  //   });

  // if (updatedProduct.nModified === 0)
  //   return res.status(400).json({
  //     success: false,
  //     message: "No products were modified.",
  //   });
};

exports.remove = removeProducts;
