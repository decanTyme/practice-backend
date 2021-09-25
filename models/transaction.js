const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const TransactionSchema = new Schema(
  {
    type: { type: String, required: true },
    customer: { type: ObjectId, ref: "Customer" },
    paid: { type: Boolean, default: false },
    shippedVia: { type: ObjectId, ref: "Courier" },
    shippedOn: Date,
    arrivedOn: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", TransactionSchema);
