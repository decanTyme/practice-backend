const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const CustomerSchema = new Schema(
  {
    _type: { type: String, required: true },
    designation: { type: String, default: "N/A" },
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    contacts: [{ type: String, required: true }],
    address: {
      street: String,
      purok: String,
      barangay: String,
      city: String,
      province: String,
      postcode: Number,
    },
    bio: { type: String, default: "Insert customer information here..." },
    debt: { type: Number, default: 0 },
    addedBy: { type: ObjectId, ref: "User", required: true },
    updatedBy: [{ type: ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Customer", CustomerSchema);
