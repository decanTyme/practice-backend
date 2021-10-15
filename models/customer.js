const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const customerTypes = [
  "retail",
  "reseller",
  "bulker",
  "city distributor",
  "provincial distributor",
];

const CustomerSchema = new Schema(
  {
    _type: {
      type: String,
      enum: customerTypes,
      required: true,
    },
    company: {
      type: ObjectId,
      ref: "Brand",
      required: function () {
        return this._type !== "retail" || this._type !== "bulker";
      },
    },
    designation: { type: String, default: "" },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
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
      street: { type: String },
      purok: { type: String },
      barangay: { type: String },
      city: { type: String },
      province: { type: String },
      postcode: { type: Number },
    },
    bio: {
      type: String,
      default: "Enter additional customer information here...",
    },
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
  options: { match: { mode: "add" } },
});

CustomerSchema.virtual("updatedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: false,
  options: { match: { mode: "update" }, sort: { date: 1 } },
});

CustomerSchema.virtual("deletedBy", {
  ref: "Activity",
  localField: "_id",
  foreignField: "record",

  justOne: true,
  options: { match: { mode: "delete" } },
});

module.exports = mongoose.model("Customer", CustomerSchema);
