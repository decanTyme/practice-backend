const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const uniqueValidator = require("mongoose-unique-validator");

const BusinessSchema = new Schema(
  {
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
  },
  {
    timestamps: true,
    strict: true,
    useNestedStrict: true,
  }
);

BusinessSchema.plugin(uniqueValidator);

module.exports = mongoose.model("Business", BusinessSchema);
