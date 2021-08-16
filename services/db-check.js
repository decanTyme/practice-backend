const db = require("../db");

async function checkDbConnection(req, res, next) {
  // Mongoose connect flag
  await db
    .then(() => {
      console.log("Successfully connected to database!");
      req.isDbConnected = true;
    })
    .catch((error) => {
      console.log("Unable to connect to database!");
      req.isDbConnected = false;
      req.dbErr = error;
      console.error(error);
    });

  next();
}

module.exports = checkDbConnection;
