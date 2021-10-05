const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const StockSchema = new Schema(
  {
    variant: { type: ObjectId, ref: "Variant", required: true },
    batch: { type: String, required: true },
    _type: {
      type: String,
      enum: ["inbound", "warehouse", "shipped", "sold"],
      default: "inbound",
      required: true,
    },
    checked: { type: Boolean, default: false },
    quantity: { type: Number, required: true },
    purchasedOn: { type: Date, required: true },
    pricePerUnit: { type: Number, required: true },
    description: {
      type: String,
      default: "Any description or remarks of the batch here...",
    },
    manufacturedOn: { type: Date, required: true },
    expiry: { type: Date, required: true },
    courier: { type: ObjectId, ref: "Courier" },
    arrivedOn: {
      type: Date,
      required: function () {
        return this._type === "warehouse" || this._type === "shipped";
      },
    },
    owner: { type: ObjectId, ref: "Customer" },
    addedBy: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Stock", StockSchema);
