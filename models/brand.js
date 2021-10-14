const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const uniqueValidator = require("mongoose-unique-validator");

const BrandSchema = new Schema(
  {
    _type: { type: String },
    name: { type: String, required: true, unique: true },
    locations: [
      {
        _type: { type: String, required: true },
        street: { type: String, required: true },
        purok: { type: String, required: true },
        barangay: { type: String, required: true },
        province: { type: String, required: true },
        postcode: { type: String, required: true },
      },
    ],
    bio: {
      type: String,
      default: "Insert additional brand information here...",
    },
    links: [{ type: String, enum: ["Inc.", "Co.", "Corp.", "LLC", "Ltd."] }],
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
