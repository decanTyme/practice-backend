const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const event = new Schema({
  name: String,
  date: String,
  venue: String,
});

module.exports = mongoose.model("Event", event);
