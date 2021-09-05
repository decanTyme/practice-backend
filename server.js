"use strict";

const mongoose = require("mongoose");
const server = require("./app");

// Checks if port is valid
const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) return val;
  if (port >= 0) return port;

  return false;
};

// Error checking
server.on("error", (error) => {
  if (error.syscall !== "listen") throw error;

  const address = server.address;
  const bind = typeof address === "string" ? `pipe ${address}` : `port ${port}`;

  switch (error.code) {
    case "EACCES":
      console.error(bind + " require elevated priviliges.");
      process.exit(1);

    case "EADDRINUSE":
      console.error(bind + " is already in use.");
      process.exit(1);

    default:
      throw error;
  }
});

const port = normalizePort(process.env.PORT || "8080");

/**
 * Use to connect to database first before listening for requests.
 */
async function connect() {
  try {
    await mongoose.connect(process.env.URI_MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    server.listen(port, () => {
      const address = server.address;
      const bind =
        typeof address === "string" ? `pipe ${address}` : `port ${port}`;

      console.log(
        `[${new Date().toUTCString()}] BTPH API listening on ${bind}`
      );
    });
  } catch (err) {
    console.log("Database connect error:", err);
  }
}

connect();
