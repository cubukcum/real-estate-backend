const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const pool = require("../db"); // Adjust this path to your database connection file
const router = express.Router();

// Admin login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate request body
    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    // Fetch admin from database
    const adminQuery = "SELECT * FROM admins WHERE email = $1";
    const adminResult = await pool.query(adminQuery, [email]);

    if (adminResult.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found." });
    }

    const admin = adminResult.rows[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Generate JWT token
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in /admin/login:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

router.get("/verify-token", (req, res) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    jwt.verify(token, process.env.JWT_SECRET);
    res.status(200).json({ message: "Token is valid" });
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token" });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const totalProjects = await pool.query("SELECT COUNT(*) FROM projects");
    const availableApartments = await pool.query(
      "SELECT COUNT(*) FROM apartments WHERE is_available = true"
    );
    const visitorsToday = 42; // Simulated; replace with real analytics.

    res.json({
      totalProjects: totalProjects.rows[0].count,
      availableApartments: availableApartments.rows[0].count,
      visitorsToday,
    });
  } catch (error) {
    console.error("Error fetching stats:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
