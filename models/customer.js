let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let ObjectId = mongoose.Types.ObjectId;

let customer = new Schema({
  name: String,
  contact: String,
  dateOfTransaction: Date,
  productCode: [{type: ObjectId, ref: 'Product'}],
  quantity: Number,
  totalProcured: Number,
});

module.exports = mongoose.model('Customer', customer);