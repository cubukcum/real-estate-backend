const bcrypt = require("bcrypt");
const pool = require("../db"); // Import the database connection

async function seedAdmin() {
  try {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await pool.query(
      "INSERT INTO admins (email, password) VALUES ($1, $2) ON CONFLICT DO NOTHING",
      ["admin@example.com", hashedPassword]
    );
    console.log("Admin user seeded successfully!");
  } catch (error) {
    console.error("Error seeding admin user:", error.message);
  } finally {
    pool.end(); // Close the database connection
  }
}

seedAdmin();
