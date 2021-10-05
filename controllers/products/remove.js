const Product = require("../../models/product");
const Stock = require("../../models/stock");

const removeProducts = async (req, res) => {
  console.log(req.query);
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

module.exports = removeProducts;
