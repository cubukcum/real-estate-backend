const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const projectRoutes = require("./routes/projects");
const adminRoutes = require("./routes/admin");
const uploadRoutes = require("./routes/uploadRoutes");

// Middleware
app.use(bodyParser.json());

// Configure CORS
const corsOptions = {
  origin: "http://localhost:3000",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

// Add custom OPTIONS handler for preflight requests
app.options("*", cors(corsOptions));

const authMiddleware = require("./middleware/auth");

// Protect admin-related routes
app.use("/admin/dashboard", authMiddleware, adminRoutes);

// Routes
app.use("/projects", projectRoutes);
app.use("/admin", adminRoutes);
app.use("/upload", uploadRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
