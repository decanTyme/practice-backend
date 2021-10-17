// Imports
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const boolParser = require("express-query-boolean");

// Load Environment Variables
require("dotenv").config();

// Express Instance
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(boolParser());

// CORS Headers
app.use(
  cors({
    origin: "http://localhost:3000",
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
const allProtectedRoutes = require("./routes");
const authenticateToken = require("./services/authenticate-token");

// Custom Headers
app.use((_, res, next) => {
  res.setHeader("Vary", "Origin");
  res.setHeader("Cache-Control", "no-cache, must-revalidate");
  next();
});

// Routes Integration
app.use("/api/auth", authRoutes);
app.use("/api", authenticateToken, allProtectedRoutes);

module.exports = app;
