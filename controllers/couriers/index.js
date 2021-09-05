const addCouriers = require("./add");
const loadCouriers = require("./load");
const modifyCouriers = require("./modify");
const removeCouriers = require("./remove");

exports.load = loadCouriers;
exports.add = addCouriers;
exports.modify = modifyCouriers;
exports.remove = removeCouriers;
