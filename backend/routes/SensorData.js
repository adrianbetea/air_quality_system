const express = require("express");
const router = express.Router();
const pool = require("./database");

SERVER_URL = "http://192.168.0.105";

// Endpoint to det data from server and save to database
router.get("/save/sensor-data/to-database", async (req, res) => {
  try {
    // Get data from server
    const response = await axios.get(SERVER_URL);
    const data = response.data;

    const sensorEntries = Object.entries(data);
    const now = new Date();
    now.setHours(now.getHours() + 3); // adaugă 2 ore

    const timestamp = now.toISOString().slice(0, 19).replace("T", " "); // format YYYY-MM-DD HH:MM:SS

    for (const [SENSOR_TYPE, SENSOR_VALUE] of sensorEntries) {
      console.log(
        `Tip senzor: ${SENSOR_TYPE}, Valoare: ${SENSOR_VALUE}, Timp: ${timestamp}`
      );

      // Save to database query
      const query =
        "INSERT INTO SENSOR_DATA(sensor_type, sensor_value, sensor_data_timestamp) VALUES (?, ?, ?)";
      pool.query(query, [SENSOR_TYPE, SENSOR_VALUE, timestamp], (err) => {
        if (err) {
          console.error("Eroare la inserarea datelor:", err);
        }
      });
    }

    res.send("Server data saved to database!");
  } catch (error) {
    console.error("Eroare la preluarea datelor:", error);
    res.status(500).send("Eroare la preluarea datelor");
  }
});

// Endpoint do save sensordata without saving it to database
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
module.exports = router;
