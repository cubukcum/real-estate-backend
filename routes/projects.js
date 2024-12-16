const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all projects
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM projects");
    res.json(result.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// Get a specific project by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM projects WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).send("Project not found");
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
