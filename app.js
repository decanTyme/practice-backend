// Imports
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Load Environment Variables
require("dotenv").config();

// Express Instance
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Headers
app.use(
  cors({
    origin: "https://bodytalks-ph.herokuapp.com",
    allowedHeaders: [
      "Origin",
      "Content",
      "Accept",
      "Content-Type",
      "Credentials",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// Routes
const authRoutes = require("./routes/auth");
const itemRoutes = require("./routes/items");

// Custom Headers
app.use((req, res, next) => {
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  next();
});

// Routes Integration
app.use("/api", authRoutes);
app.use("/api", itemRoutes);

module.exports = app;
