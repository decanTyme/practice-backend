let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let dsc_event = new Schema({
  name: String,
  date: String,
  venue: String
});

module.exports = mongoose.model('Event', dsc_event);