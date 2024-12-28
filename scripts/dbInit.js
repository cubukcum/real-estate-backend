const { Pool } = require("pg");
require("dotenv").config({ path: '../.env' });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
// });

const createTableQuery = `
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    address TEXT NOT NULL,
    totalConstructionArea NUMERIC(10, 2) NOT NULL,
    totalApartments INT NOT NULL,
    roomType VARCHAR(50),
    startDate DATE NOT NULL,
    deliveryDate DATE NOT NULL,
    availableForSale BOOLEAN NOT NULL,
    description TEXT
);
`;

const insertDataQuery = `
INSERT INTO projects (title, address, totalConstructionArea, totalApartments, roomType, startDate, deliveryDate, availableForSale, description)
VALUES 
    ('Green Hills Residency', '123 Maple Rd, Greenfield', 10500.00, 200, '3+1', '2023-05-15', '2025-12-30', TRUE, 'A modern eco-friendly residential complex with spacious apartments and communal gardens.'),
    ('Skyline Tower', '789 Pine Ave, Uptown', 15000.00, 300, '2+1', '2024-06-01', '2027-01-15', TRUE, 'A luxury high-rise offering stunning city views, rooftop pool, and state-of-the-art amenities.'),
    ('Lakeside Villas', '456 Oak Ln, Riverton', 7200.00, 120, '4+1', '2023-10-01', '2025-08-20', TRUE, 'Exclusive lakeside villas featuring modern designs, private pools, and expansive gardens.'),
    ('City Edge Apartments', '101 Central Blvd, Metropolis', 9500.00, 180, '1+1', '2024-01-15', '2025-07-30', FALSE, 'Affordable yet stylish apartments perfect for young professionals.'),
    ('The Waterfront Residences', '215 Ocean Dr, Seaview', 13500.00, 250, '3+1', '2024-04-01', '2026-12-15', TRUE, 'Upscale waterfront residences with breathtaking sea views, fitness center, and spa.'),
    ('Mountain Ridge Estates', '34 High Summit Rd, Hilltop', 8000.00, 100, '2+1', '2024-02-01', '2026-06-30', TRUE, 'A secluded mountain retreat offering peace and tranquility with hiking trails and outdoor activities.'),
    ('Urban Loft Complex', '678 Market St, Downtown', 6000.00, 90, 'Studio', '2023-08-15', '2025-02-28', FALSE, 'Trendy urban lofts designed for city living with open spaces and industrial finishes.'),
    ('Sunset Gardens', '54 Sunset Blvd, Westview', 11000.00, 180, '3+1', '2024-07-01', '2026-10-15', TRUE, 'A peaceful residential project with lush gardens and family-oriented amenities.'),
    ('Riverfront Plaza', '345 Riverside Dr, Bridgeport', 20000.00, 500, '2+1', '2023-11-01', '2026-03-15', TRUE, 'Mixed-use development with residential, retail, and entertainment spaces along the river.'),
    ('Parkview Heights', '910 Park Ave, Greenborough', 14000.00, 240, '3+1', '2024-03-01', '2026-09-30', TRUE, 'A luxury residential community with easy access to parks, schools, and shopping areas.')
ON CONFLICT DO NOTHING;
`;

const createAdminTable = `
CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
);`;

const createImagesTable = `
CREATE TABLE IF NOT EXISTS project_images (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id),
    file_key VARCHAR(255), 
    file_name VARCHAR(255),  
    file_size INTEGER, 
    content_type VARCHAR(100), 
    url TEXT,    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`

const initializeDatabase = async () => {
  try {
    console.log("Connecting to the database...");
    const client = await pool.connect();
    console.log("Connected to the database.");

    // Create table
    console.log("Creating table...");
    await client.query(createTableQuery);

    // Insert data
    console.log("Inserting initial data...");
    await client.query(insertDataQuery);

    console.log("Creating admin table...");
    await client.query(createAdminTable);

    console.log("Creating images table...");
    await client.query(createImagesTable);

    console.log("Database initialized successfully.");
    client.release();
  } catch (error) {
    console.error("Error initializing database:", error.message);
  } finally {
    await pool.end();
  }
};

initializeDatabase();
