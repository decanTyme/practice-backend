const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const ProductSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: String, required: true },
    __class: { type: String, required: true },
    category: { type: String, required: true },
    prices: [
      {
        label: { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],
    variants: [
      {
        name: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    imgURL: [{ type: String }],
    stock: {
      quantity: {
        inbound: { type: Number, required: true },
        warehouse: { type: Number, required: true },
        shipped: { type: Number, required: true },
      },
      unit: { type: String, required: true },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
