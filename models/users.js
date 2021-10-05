const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  role: { type: String, required: true },
  bio: { type: String },
  profileImgURL: { type: String },
});

UserSchema.plugin(uniqueValidator);

module.exports = mongoose.model("User", UserSchema);
