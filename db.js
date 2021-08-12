const mongoose = require("mongoose");

// Mongoose connect
const uri =
  "mongodb://127.0.0.1:27017/?snappy=enabled&gssapiServiceName=mongodb";
const mOpts = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
};

// Mongoose connect events
// let isDbConnected = false;
// let db = mongoose.connection;
// db.on("connecting", () => {
//   console.log("Connecting to the database...");
// });

// db.on("error", (err) => {
//   console.log("Database connect error: ", err);
//   isDbConnected = false;
//   mongoose.disconnect();
// });

// db.on("reconnected", () => {
//   console.log("Database successfully reconnected!");
//   isDbConnected = true;
// });

// db.on("disconnected", function () {
//   console.log("MongoDB disconnected!");
//   isDbConnected = false;
//   mongoose.connect(uri, mOpts);
// });

// db.on("connected", () => {
//   console.log("Database connected!");
//   isDbConnected = true;
// });

// db.on("open", () => {
//   console.log("Database connection successfully opened!");
//   isDbConnected = true;
// });

module.exports = mongoose.connect(uri, mOpts);
