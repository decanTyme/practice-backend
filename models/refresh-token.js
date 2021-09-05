const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RefreshTokens = new Schema({
  token: { type: String, required: true },
  rememberUser: { type: Boolean, required: true },
});

module.exports = mongoose.model("Refresh Token", RefreshTokens);
