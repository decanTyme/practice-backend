"use strict";

// Imports
const express = require("express");
const app = express();
const authenticateToken = require("./services/authenticate-token");

// Routes
const authRoutes = require("./routes/auth-api");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});

app.use("/api", authRoutes);

const normalizePort = (val) => {
  const port = parseInt(val, 10);

  if (isNaN(port)) return val;
  if (port >= 0) return port;

  return false;
};

app.on("error", (error) => {
  if (error.syscall !== "listen") throw error;

  const address = app.address;
  const bind =
    typeof address === "string" ? "pipe " + address : "port: " + port;

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

let port = normalizePort(process.env.PORT || "8080");

app.listen(port, () => {
  const address = app.address;
  const bind = typeof address === "string" ? "pipe " + address : "port " + port;
  console.log(`BTPH API listening on ${bind}`);
});
