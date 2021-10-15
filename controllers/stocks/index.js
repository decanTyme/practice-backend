const addStocks = require("./add");
const loadStocks = require("./load");
const modifyStocks = require("./modify");
const markStocks = require("./mark");
const moveStocks = require("./move");
const removeStocks = require("./remove");

exports.load = loadStocks;

exports.add = addStocks;

exports.modify = modifyStocks;

exports.mark = markStocks;

exports.move = moveStocks;

exports.remove = removeStocks;
