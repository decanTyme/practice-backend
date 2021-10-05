const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const OrderSchema = new Schema(
  {
    _type: { type: String, required: true },
    products: [
      {
        item: { type: ObjectId, ref: "Product", required: true },
        quantity: { type: String, required: true },
      },
    ],
    customer: { type: ObjectId, ref: "Customer" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
