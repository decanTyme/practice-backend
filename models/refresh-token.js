let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let RefreshTokens = new Schema({
  token: { type: String, required: true },
  rememberUser: { type: Boolean, required: true },
});

module.exports = mongoose.model("Refresh Tokens", RefreshTokens);
