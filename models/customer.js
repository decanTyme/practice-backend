const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const CustomerSchema = new Schema(
  {
    _type: {
      type: String,
      enum: [
        "retail",
        "reseller",
        "bulker",
        "city distributor",
        "provincial distributor",
      ],
      required: true,
    },
    company: {
      type: ObjectId,
      ref: "Brand",
      required: function () {
        return this._type !== "retail";
      },
    },
    designation: { type: String, default: "" },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    contacts: [
      {
        telcom: { type: String, required: true },
        number: { type: String, required: true },
      },
    ],
    address: {
      street: String,
      purok: String,
      barangay: String,
      city: String,
      province: String,
      postcode: Number,
    },
    bio: { type: String, default: "Insert customer information here..." },
    displayPic: {
      type: String,
      default:
        "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png",
    },
    debt: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// CustomerSchema.virtual("fullname").get(function () {
//   return `${this.firstName} ${this.lastName}`;
// });

CustomerSchema.virtual("transactions", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "customer",

  justOne: false,
  options: { sort: { purchasedOn: 1 } },
});

CustomerSchema.virtual("addedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: {
    match: { mode: "add" },
  },
});

CustomerSchema.virtual("updatedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: false,
  options: {
    match: { mode: "update" },
    sort: { date: 1 },
  },
});

CustomerSchema.virtual("deletedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: {
    match: { mode: "delete" },
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
