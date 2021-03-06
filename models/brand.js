const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const BrandSchema = new Schema(
  {
    _type: { type: String, enum: ["Inc.", "Co.", "Corp.", "LLC", "Ltd."] },
    name: { type: String, required: true, unique: true },
    locations: {
      type: Array,
      of: {
        _type: { type: String, enum: ["main", "branch"], required: true },
        postcode: { type: Number, required: true },
        street: { type: String, required: true },
        purok: { type: String, required: true },
        barangay: { type: String, required: true },
        city: { type: String, required: true },
        province: { type: String, required: true },
      },
      default: [],
    },
    bio: {
      type: String,
      default: "Insert additional brand information here...",
    },
    links: [{ type: String }],
    images: {
      type: Array,
      of: { url: { type: String }, caption: { type: String } },
      default: { caption: "Insert caption here..." },
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

BrandSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "brand",

  justOne: false,
  options: { sort: { name: 1 } },
});

BrandSchema.virtual("members", {
  ref: "Customer",
  localField: "_id",
  foreignField: "company",

  justOne: false,
  options: { sort: { name: 1 } },
});

BrandSchema.virtual("addedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "add" } },
});

BrandSchema.virtual("updatedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: false,
  options: { match: { mode: "update" }, sort: { date: 1 } },
});

BrandSchema.virtual("deletedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "delete" } },
});

BrandSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Brand", BrandSchema);
