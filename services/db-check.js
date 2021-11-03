const db = require("../db");

async function checkDbConnection(req, res, next) {
  // Mongoose connect flag
  await db
    .then(() => {
      console.log(`[${new Date().toLocaleString()}]`, "Database connected");
      req.isDbConnected = true;
    })
    .catch((error) => {
      req.isDbConnected = false;
      req.databaseConnectError = error;
      console.error(
        `[${new Date().toLocaleString()}]`,
        "Database connect error!",
        error
      );
    });

  next();
}

module.exports = checkDbConnection;
