const db = require("../db");

async function checkDbConnection(req, res, next) {
  // Mongoose connect flag
  await db
    .then(() => {
      req.isDbConnected = true;
    })
    .catch((error) => {
      req.isDbConnected = false;
      req.dbErr = error;
      console.error(error);
    });

  next();
}

module.exports = checkDbConnection;
