let mongoose = require("mongoose");
let Schema = mongoose.Schema;

let event = new Schema({
  name: String,
  date: String,
  venue: String,
});

module.exports = mongoose.model("Event", event);
