let mongoose = require("mongoose");
let uniqValidator = require("mongoose-unique-validator");

let Schema = mongoose.Schema;

let userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  role: { type: String, required: true },
  profileImgUrl: { type: String },
});

userSchema.plugin(uniqValidator);

module.exports = mongoose.model("User", userSchema);
