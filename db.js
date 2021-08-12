const mongoose = require("mongoose");

// Mongoose connect
const uri =
  "mongodb+srv://JlearnUse:wVmV4RL0am4MuinO@learningcluster0.p98nk.mongodb.net/btph?retryWrites=true&w=majority";
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

mongoose.connect(uri, mOpts);
module.exports = mongoose.connection;
