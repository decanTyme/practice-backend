const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const ordersSchema = new Schema(
  {
    type: { type: String, required: true },
    code: { type: Number, required: true, immutable: true },
    contact: { type: String, required: true },
    _productCode: [{ type: ObjectId, ref: "Product" }],
    quantity: { type: Number, required: true },
    totalProcured: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Orders", ordersSchema);
