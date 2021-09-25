const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const StockSchema = new Schema(
  {
    product: { type: ObjectId, ref: "Product", required: true },
    quantity: {
      inbound: { type: Number, required: true },
      warehouse: { type: Number, required: true },
      shipped: { type: Number, required: true },
    },
    unit: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock Info", StockSchema);
