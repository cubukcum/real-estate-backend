const express = require("express");
const router = express.Router();
const pool = require("../db");

// Get all messages (protected route for admin)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching messages:", error.message);
    res.status(500).json({ error: "Server Error" });
  }
});

// Create a new message (public route)
router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const query = `
      INSERT INTO contact_messages (name, email, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;

    const result = await pool.query(query, [name, email, message]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating message:", error.message);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Update message status (protected route for admin)
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["read", "unread"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const query = `
      UPDATE contact_messages 
      SET status = $1 
      WHERE id = $2 
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating message status:", error.message);
    res.status(500).json({ error: "Failed to update message status" });
  }
});

// Delete a message (protected route for admin)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM contact_messages WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Message not found" });
    }

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error deleting message:", error.message);
    res.status(500).json({ error: "Failed to delete message" });
  }
});

module.exports = router;
