// Imports
const express = require("express");
const app = express();

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");

// Necessary CORS headers
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://bodytalks-ph.herokuapp.com"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, Content, Accept, Content-Type, Credentials"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  next();
});

// Routes integration
app.use("/api", authRoutes);
app.use("/api", itemRoutes);

module.exports = app;
