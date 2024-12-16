const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
const projectRoutes = require("./routes/projects");
const adminRoutes = require("./routes/admin");

// Middleware
app.use(bodyParser.json());

// Configure CORS
const corsOptions = {
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: ["GET", "POST", "PUT", "DELETE"], // Specify allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Specify allowed headers
};
app.use(cors(corsOptions));

const authMiddleware = require("./middleware/auth");

// Protect admin-related routes
app.use("/admin/dashboard", authMiddleware, adminRoutes);

// Routes
app.use("/projects", projectRoutes);
app.use("/admin", adminRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
