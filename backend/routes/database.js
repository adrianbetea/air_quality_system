// database.js
const { createPool } = require("mysql2");

const pool = createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "air_quality_system_db",
  connectionLimit: 10,
}).promise();

pool
  .query("SELECT 1")
  .then(() => console.log("Connected to database!"))
  .catch((err) => console.error("Eroare la conectarea la baza de date:", err));

module.exports = pool;
