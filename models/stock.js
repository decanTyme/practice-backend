const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const uniqueValidator = require("mongoose-unique-validator");

const StockSchema = new Schema(
  {
    variant: { type: ObjectId, ref: "Variant", required: true },
    batch: { type: String, required: true, unique: true },
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
    updatedBy: [
      {
        user: { type: ObjectId, ref: "User" },
        timestamp: { type: Date, default: new Date().toISOString() },
      },
    ],
    deletedBy: [
      {
        user: { type: ObjectId, ref: "User" },
        timestamp: { type: Date, default: new Date().toISOString() },
      },
    ],
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
  }
);

StockSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Stock", StockSchema);
