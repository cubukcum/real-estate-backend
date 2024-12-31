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

// Get all images for a specific project
router.get("/:id/images", async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if project exists
    const projectCheck = await pool.query(
      "SELECT id FROM projects WHERE id = $1",
      [id]
    );

    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get all images for the project
    const result = await pool.query(
      `SELECT id, file_key, file_name, file_size, content_type, url, created_at 
       FROM project_images 
       WHERE project_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching project images:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

module.exports = router;
