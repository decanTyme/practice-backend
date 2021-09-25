const db = require("../db");

async function checkDbConnection(req, res, next) {
  // Mongoose connect flag
  await db
    .then(() => {
      console.log("Database connected");
      req.isDbConnected = true;
    })
    .catch((error) => {
      req.isDbConnected = false;
      req.databaseConnectError = error;
      console.error("Database connect error!", error);
    });

  next();
}

module.exports = checkDbConnection;
