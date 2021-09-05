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
      enum: ["inbound", "warehouse", "sold"],
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
    eta: { type: Date },
    arrivedOn: {
      type: Date,
      required: function () {
        return this._type === "warehouse" || this._type === "sold";
      },
    },
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

StockSchema.virtual("addedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "add" } },
});

StockSchema.virtual("updatedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: false,
  options: { match: { mode: "update" }, sort: { date: 1 } },
});

StockSchema.virtual("deletedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "delete" } },
});

StockSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Stock", StockSchema);
