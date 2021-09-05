const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const OrderSchema = new Schema(
  {
    _type: { type: String, required: true },
    products: [
      {
        item: { type: ObjectId, ref: "Variant", required: true },
        quantity: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", OrderSchema);
