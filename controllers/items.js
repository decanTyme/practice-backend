// Mongoose model imports
const Product = require("../models/product");
const Event = require("../models/events");

const KW_EVENT = "event";
const KW_PRODUCT = "product";

exports.addProduct = (req, res, next) => {
  if (req.query.i === KW_PRODUCT) {
    const product = new Product({
      name: req.body.name,
      code: req.body.code,
      class: req.body.class,
      category: req.body.category,
      quantity: req.body.quantity,
      price: req.body.price,
      salePrice: req.body.salePrice,
    });

    product
      .save()
      .then((savedProduct) => {
        res.status(201).json(savedProduct);
      })
      .catch((error) => {
        res
          .salePrice(500)
          .json({ error: "There was an error in saving the product." });
      });
  } else if (req.query.i === KW_EVENT) {
    const event = new Event({
      name: req.body.name,
      date: req.body.date,
      venue: req.body.venue,
    });

    event
      .save()
      .then((savedProduct) => {
        res.status(201).json(savedProduct);
      })
      .catch((error) => {
        res
          .salePrice(500)
          .json({ error: "There was an error in saving the product." });
      });
  } else {
    res.status(404).json({ error: "Not found." });
  }
};

exports.updateProduct = (req, res, next) => {
  const newProduct = new Product({
    _id: req.body.id,
    name: req.body.name,
    code: req.body.code,
    class: req.body.class,
    category: req.body.category,
    quantity: req.body.quantity,
    price: req.body.price,
    salePrice: req.body.salePrice,
  });

  Product.updateOne({ _id: req.body.id }, newProduct)
    .then(() => {
      res.status(201).json({ message: "Product updated successfully." });
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
        message: "There was an error in updating the product.",
      });
    });
};

exports.deleteProduct = (req, res, next) => {
  if (req.query.i === KW_PRODUCT) {
    Product.deleteOne({ _id: req.query._id })
      .then((deletedProduct) => {
        res.status(200).json({
          deletedItem: deletedProduct,
          message: "Successfully deleted the item.",
        });
      })
      .catch((error) => {
        res.status(500).json({
          error: error,
          message: "There was an error in deleting the product.",
        });
      });
  } else if (req.query.i === KW_EVENT) {
    Event.deleteOne({ _id: req.query._id })
      .then((deletedEvent) => {
        res.status(200).json({
          deletedItem: deletedEvent,
          message: "Successfully deleted the event.",
        });
      })
      .catch((error) => {
        res.status(500).json({
          error: error,
          message: "There was an error in deleting the event.",
        });
      });
  }
};

exports.load = (req, res, next) => {
  let uriQueries = req.query;
  if (uriQueries.item_ == KW_PRODUCT + "s") {
    Product.find()
      .then((products) => {
        res.json(products);
      })
      .catch((error) => {
        res.status(500).json({
          error: error,
          message:
            "There was an error in retrieving the products. Please try again later.",
        });
      });
  } else if (uriQueries.item_ == KW_EVENT + "s") {
    Event.find({})
      .then((events) => {
        res.json(events);
      })
      .catch((error) => {
        res.status(500).json({
          error: error,
          message:
            "There was an error in retrieving the events. Please try again later.",
        });
      });
  } else {
    if (uriQueries.item_ == KW_PRODUCT) {
      Product.findOne({ _id: uriQueries._id })
        .then((product) => {
          res.json(product);
        })
        .catch((error) => {
          res.status(404).json({
            error: error,
            message: `No product with id '${uriQueries._id}' found.`,
          });
        });
    } else if (uriQueries.item_ == KW_EVENT) {
      Product.findOne({ _id: uriQueries._id })
        .then((event) => {
          res.json(event);
        })
        .catch((error) => {
          res.status(404).json({
            error: error,
            message: `No event with id '${uriQueries._id}' found.`,
          });
        });
    }
  }
};