const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;

const CourierSchema = new Schema(
  {
    name: { type: String, required: true },
    contacts: [{ type: String, required: true }],
    address: {
      street: String,
      purok: String,
      barangay: String,
      city: String,
      province: String,
      postcode: Number,
    },
    bio: { type: String, default: "Insert extra courier information here..." },
    addedBy: { type: ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Courier", CourierSchema);
