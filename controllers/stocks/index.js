const addStocks = require("./add");
const loadStocks = require("./load");
const modifyStocks = require("./modify");

exports.load = loadStocks;

exports.add = addStocks;

exports.modify = modifyStocks;

exports.remove = null;
