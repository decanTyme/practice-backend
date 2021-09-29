const mongoose = require("mongoose");

// Mongoose model imports
const Product = require("../../models/product");
const Event = require("../../models/events");
const Order = require("../../models/order");

const ITEM_PRODUCT = "product";
const ITEM_CUSTOMER = "customer";
const ITEM_ORDER = "order";

exports.load = (req, res) => {
  const queries = req.query;

  if (queries.populated) {
    Product.find()
      .then((products) => {
        res.json(products);
      })
      .catch((error) => {});
  } else {
    Product.find()
      .then((products) => {
        res.json(products);
      })
      .catch((error) => {});
  }
};

exports.add = async (req, res) => {
  const params = req.query;

  console.log(typeof req.body, params);
  switch (params._item) {
    case ITEM_PRODUCT:
      // In case the API user says the data is an array
      if (params.isArray) {
        const data = req.body;
        const responses = [];

        try {
          for await (const item of data) {
            // const alreadySavedProduct = Product.findOne({
            //   name: item.name,
            //   brand: item.brand,
            // });
            // console.log(alreadySavedProduct, data);

            if (true) {
              const savedProduct = await new Product({
                code: item.code,
                brand: item.brand,
                name: item.name,
                class: item.class,
                category: item.category,
                price: item.price,
                stock: {
                  inbound: item.stock.inbound,
                  warehouse: item.stock.warehouse,
                  shipped: item.stock.shipped,
                },
              }).save();

              responses.push({ product: savedProduct });
            }

            // responses.push(item);
          }

          res.status(201).json({
            products: responses,
            success: true,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            error: error,
            message: "There was an error in saving the product.",
          });
        }
      } else {
        try {
          console.log(req.body);

          // const savedProduct = await new Product({
          //   _id: productId,
          //   code: req.body.code,
          //   brand: req.body.brand,
          //   name: req.body.name,
          //   class: req.body.class,
          //   category: req.body.category,
          //   price: req.body.price,
          // }).save();

          res.status(201).json({
            product: "savedProduct",
            stock: "productStock",
            success: true,
          });
        } catch (error) {
          console.log(error);
          res.status(500).json({
            error: error,
            message: "There was an error in saving the product.",
          });
        }
      }

      break;

    case ITEM_ORDER:
      const orderId = new mongoose.Types.ObjectId();

      const products = req.body.products;
      for (const productId in products) {
        if (Object.hasOwnProperty.call(products, productId)) {
          const element = products[productId];
          console.log(element);

          Product.findById(element).then((product) => {
            console.log(product);
          });
        }
      }

      new Order({
        _id: orderId,
        type: req.body.type,
        products: req.body.products,
      })
        .save()
        .then((savedOrder) => {
          res.status(201).json({
            order: savedOrder,
            success: true,
          });
        })
        .catch((error) => {
          res.status(500).json({
            error: error,
            message: "There was an error in saving the order.",
          });
        });
      break;

    case ITEM_PRODUCT:
      break;

    default:
      res.status(404).json({ error: "Not found." });
      break;
  }
};

exports.updateProduct = async (req, res) => {
  const { access, body } = req;

  const newProduct = body;
  const newStock = newProduct.stock;
  delete newProduct.stock;

  const productId = newProduct._id;
  const stockId = newStock._id;

  try {
    if (access) {
      return Product.findByIdAndUpdate(
        productId,
        newProduct,
        {
          new: true,
          runValidators: true,
          upsert: true,
        },
        (err, updatedProduct) => {
          if (err) throw Error(err);

          Stock.findByIdAndUpdate(
            stockId,
            newStock,
            {
              new: true,
              runValidators: true,
              upsert: true,
            },
            (err, updatedStock) => {
              if (err) throw Error(err);

              res.status(201).json({
                success: true,
                message: "Product updated successfully.",
                product: updatedProduct,
                stock: updatedStock,
              });
            }
          );
        }
      );
    }

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

exports.deleteProduct = (req, res) => {
  console.log(req.body);
  if (req.query._item === ITEM_PRODUCT) {
    Product.deleteOne({ _id: req.body._id })
      .then((deletedProduct) => {
        if (deletedProduct.n === 0)
          return res.status(400).json({
            success: false,
            message: `There was product with id: ${req.body._id}`,
          });

        res.status(200).json({
          deletedItem: deletedProduct,
          success: true,
          message: "Successfully deleted the item.",
        });
      })
      .catch((error) => {
        res.status(500).json({
          error: error,
          message: "There was an error in deleting the product.",
        });
      });
  } else if (req.query.item_ === ITEM_CUSTOMER) {
    Event.deleteOne({ _id: req.query._id })
      .then((deletedEvent) => {
        res.status(200).json({
          deletedItem: deletedEvent,
          success: true,
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
