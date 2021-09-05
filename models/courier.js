const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const CourierSchema = new Schema(
  {
    _type: {
      type: String,
      enum: ["tracking", "regular", "cod", "others"],
      required: true,
    },
    name: { type: String, required: true },
    contacts: {
      type: Array,
      of: {
        telcom: { type: String, required: true },
        number: { type: String, required: true },
      },
      required: true,
      validate: (arr) => arr == null || arr.length > 0,
    },
    address: {
      street: String,
      purok: String,
      barangay: String,
      city: String,
      province: String,
      postcode: Number,
    },
    links: [{ type: String }],
    bio: { type: String, default: "Insert extra courier information here..." },
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CourierSchema.virtual("addedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "add" } },
});

CourierSchema.virtual("updatedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: false,
  options: { match: { mode: "update" }, sort: { date: 1 } },
});

CourierSchema.virtual("deletedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "delete" } },
});

module.exports = mongoose.model("Courier", CourierSchema);
