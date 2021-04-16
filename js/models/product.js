let mongoose = require('mongoose');
let Schema = mongoose.Schema;

let product = new Schema({
  name: {type: String, required: true},
  code: {type: String, required: true},
  class: {type: String, required: true},
  category: {type: String, required: true},
  quantity: {type: Number, required: true},
  price: {type: Number, required: true},
  salePrice: {type: Number, required: false}
});

module.exports = mongoose.model('Product', product);