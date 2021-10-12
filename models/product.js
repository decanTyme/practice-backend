const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const ProductSchema = new Schema(
  {
    code: { type: String, required: true },
    name: { type: String, required: true },
    brand: { type: ObjectId, ref: "Brand", required: true },
    _class: { type: String, required: true },
    category: { type: String, required: true },
    description: {
      type: String,
      default: "Description of the product here...",
    },
    unit: { type: String, enum: ["single", "set"], required: true },
    images: [
      {
        url: {
          type: String,
          default:
            "https://nayemdevs.com/wp-content/uploads/2020/03/default-product-image.png",
        },
        caption: {
          type: String,
          default: "Insert caption here...",
        },
      },
    ],
    includedIn: { type: ObjectId, ref: "Product" },
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

ProductSchema.virtual("variants", {
  ref: "Variant",
  localField: "_id",
  foreignField: "product",

  justOne: false,
  options: { sort: { name: 1 } },
});

ProductSchema.virtual("addedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "add" } },
});

ProductSchema.virtual("updatedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: false,
  options: { match: { mode: "update" }, sort: { date: 1 } },
});

ProductSchema.virtual("deletedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "delete" } },
});

// ProductSchema.virtual("composedOf", {
//   ref: "Product",
//   localField: "_id",
//   foreignField: "includedIn",

//   justOne: false,
//   options: { sort: { name: 1 } },
// });

module.exports = mongoose.model("Product", ProductSchema);
