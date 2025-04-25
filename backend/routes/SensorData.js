const express = require("express");
const router = express.Router();
const pool = require("./database");

const SERVER_URL = "http://192.168.0.107";

// Endpoint to det data from server and save to database
router.get("/", async (req, res) => {
  try {
    // Get data from server
    const response = await axios.get(SERVER_URL);
    const data = response.data;

    const sensorEntries = Object.entries(data);
    const timestamp = new Date().toISOString().slice(0, 19).replace("T", " "); // YYYY-MM-DD HH:MM:SS

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

module.exports = router;
