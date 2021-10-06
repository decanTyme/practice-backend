const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.Types.ObjectId;
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String },
  profileImgURL: { type: String },
  business: { type: ObjectId, ref: "Business" },
});

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", UserSchema);
