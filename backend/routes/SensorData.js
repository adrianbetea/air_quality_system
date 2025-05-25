const express = require("express");
const router = express.Router();
const pool = require("./database");

SERVER_URL = "http://192.168.0.105";

// Endpoint to det data from server and save to database
router.post("/save/sensor-data/to-database", async (req, res) => {
  try {
    // Get data from server
    const response = await axios.get(SERVER_URL);
    const data = response.data;

    const now = new Date();
    now.setHours(now.getHours() + 3); // ajusteaza fusul orar

    const timestamp = now.toISOString().slice(0, 19).replace("T", " "); // format YYYY-MM-DD HH:MM:SS

    const query = `
    INSERT INTO sensor_data (MQ2, MQ5, MQ135, DustDensity, Temperature, Humidity, Timestamp) 
    VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.MQ2,
      data.MQ5,
      data.MQ135,
      data.DustDensity,
      data.Temperature,
      data.Humidity,
      timestamp,
    ];

    pool.query(query, values, (err, result) => {
      if (err) {
        console.error("Eroare la inserarea datelor:", err);
        res.status(500).send("Eroare la salvarea datelor în baza de date");
        return;
      }
      res.send("Data saved to database");
    });

    res.send("Server data saved to database!");
  } catch (error) {
    console.error("Eroare la preluarea datelor:", error);
    res.status(500).send("Eroare la preluarea datelor");
  }
});

// Endpoint to save sensordata without saving it to database
router.get("/fetch-sensor-data", async (req, res) => {
  try {
    // Get data from server
    const response = await axios.get(SERVER_URL);
    const data = response.data;
    const parsedData = typeof data === "string" ? JSON.parse(data) : data;

    const sensorEntries = Object.entries(data);

    const now = new Date();
    now.setHours(now.getHours() + 3); // adaugă 2 ore

    const timestamp = now.toISOString().slice(0, 19).replace("T", " "); // format YYYY-MM-DD HH:MM:SS

    res.json({
      message: "Server data fetched",
      timestamp: timestamp,
      data: parsedData,
    });
  } catch (error) {
    console.error("Eroare la preluarea datelor:", error);
    res.status(500).send("Eroare la preluarea datelor");
  }
});

// Endpoint to fetch sensor data from database ordered by timestamp
router.get("/fetch-ordered-data/from-database", async (req, res) => {
  try {
    // Get data from database
    const [rows] = await pool.query(
      `SELECT * FROM sensor_data ORDER BY Timestamp DESC LIMIT 9`
    );

    res.json(rows.reverse()); // trimitem datele la frontend
  } catch (error) {
    console.error("Eroare la preluarea din baza de date", error);
    res.status(500).send("Eroare la preluarea din baza de date");
  }
});
module.exports = router;
