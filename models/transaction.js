const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const TransactionSchema = new Schema(
  {
    _type: { type: String, required: true },
    customer: { type: ObjectId, ref: "Customer" },
    status: {
      type: String,
      enum: ["pending", "paid", "returned", "lost"],
      default: "pending",
    },
    modeOfTransfer: { type: ObjectId, ref: "Courier", required: true },
    products: [
      {
        item: { type: ObjectId, ref: "Variant", required: true },
        quantity: { type: String, required: true },
      },
    ],
    purchasedOn: { type: Date },
    shippedOn: { type: Date },
    arrivedOn: { type: Date },
    lostOn: {
      type: Date,
      required: function () {
        return this.status === "lost";
      },
    },
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
  }
);

module.exports = mongoose.model("Transaction", TransactionSchema);
