const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema(
  {
    type: { type: String, required: true },
    name: { type: String, required: true },
    contact: [{ type: String, required: true }],
    address: {
      street: String,
      purok: String,
      barangay: String,
      province: String,
      postcode: Number,
    },
    debt: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
