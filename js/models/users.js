let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let user = new Schema({
  username: String,
  password: String
});

module.exports = mongoose.model('User', user);