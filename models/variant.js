const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const PriceSchema = new Schema(
  {
    label: {
      type: String,
      enum: [
        "sale",
        "retail",
        "reseller",
        "bulker",
        "city distributor",
        "provincial distributor",
      ],
      required: true,
    },
    value: { type: Number, required: true },
    description: {
      type: String,
      default: "Description of the price here...",
    },
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
  }
);

const VariantSchema = new Schema(
  {
    product: { type: ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    value: { type: String, required: true },
    description: {
      type: String,
      default: "Description of the variant here...",
    },
    images: [
      {
        url: { type: String },
        caption: {
          type: String,
          default: "Insert caption here...",
        },
      },
    ],
    prices: [PriceSchema],
    addedBy: { type: ObjectId, ref: "User", required: true },
    updatedBy: [{ type: ObjectId, ref: "User" }],
    deletedBy: [{ type: ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

VariantSchema.virtual("stocks", {
  ref: "Stock",
  localField: "_id",
  foreignField: "variant",

  justOne: false,
  options: { sort: { expiry: 1 } },
});

// VariantSchema.virtual("includedIn", {
//   ref: "Product",
//   localField: "product",
//   foreignField: "id",

//   justOne: false,
//   options: { sort: { name: 1 } },
// });

module.exports = mongoose.model("Variant", VariantSchema);
