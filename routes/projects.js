const express = require("express");
const router = express.Router();
const pool = require("../db");
const UploadService = require("../services/uploadService");

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
    
    // Get project details
    const projectResult = await pool.query(
      "SELECT * FROM projects WHERE id = $1",
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Get project images
    const imagesResult = await pool.query(
      `SELECT id, file_key, file_name, url 
       FROM project_images 
       WHERE project_id = $1 
       ORDER BY created_at DESC`,
      [id]
    );

    // Combine project with images
    const project = {
      ...projectResult.rows[0],
      images: imagesResult.rows
    };

    res.json(project);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server Error" });
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

// Delete a specific image from a project
router.delete("/:projectId/images/:imageId", async (req, res) => {
    console.log('Delete image request received:', {
        projectId: req.params.projectId,
        imageId: req.params.imageId
    });

    try {
        const { projectId, imageId } = req.params;

        // First get the image details
        console.log('Fetching image details from database...');
        const imageQuery = await pool.query(
            `SELECT * FROM project_images 
             WHERE id = $1 AND project_id = $2`,
            [imageId, projectId]
        );
        console.log('Image query result:', imageQuery.rows);

        if (imageQuery.rows.length === 0) {
            console.log('Image not found in database');
            return res.status(404).json({ error: "Image not found" });
        }

        const image = imageQuery.rows[0];
        console.log('Found image:', image);

        // Delete from R2
        console.log('Attempting to delete from R2 storage:', image.file_key);
        await UploadService.deleteFile(image.file_key);
        console.log('Successfully deleted from R2 storage');

        // Delete from database
        console.log('Deleting image record from database...');
        const deleteResult = await pool.query(
            "DELETE FROM project_images WHERE id = $1 RETURNING *",
            [imageId]
        );
        console.log('Database deletion result:', deleteResult.rows[0]);

        res.json({ 
            message: "Image deleted successfully",
            deletedImage: deleteResult.rows[0]
        });
    } catch (error) {
        console.error("Error deleting image:", {
            error: error.message,
            stack: error.stack
        });
        res.status(500).json({ 
            error: "Failed to delete image",
            details: error.message
        });
    }
});

module.exports = router;
