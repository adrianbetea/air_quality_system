const express = require("express");
const router = express.Router();
const pool = require("./database");
const env = require("../../env.js");

const SERVER_URL = env.SERVER_URL;

function getChartTime(range) {
  const now = new Date();
  switch (range) {
    case "1h":
      return new Date(now.getTime() - 60 * 60 * 1000);
    case "today":
      return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    case "1d":
      return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    case "7d":
      return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    case "30d":
      return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    default:
      return null;
  }
}

router.get("/sensor-data", async (req, res) => {
  const { sensor, range } = req.query;
  const allowedSensors = [
    "MQ2",
    "MQ5",
    "MQ135",
    "DustDensity",
    "Temperature",
    "Humidity",
  ];
  if (!allowedSensors.includes(sensor)) {
    return res.status(400).json({ error: "Invalid sensor parameter" });
  }

  if (!sensor || !range) {
    return res.status(400).json({ error: "Missing sensor or range parameter" });
  }

  const chartTime = getChartTime(range);
  if (!chartTime || isNaN(chartTime.getTime())) {
    return res.status(400).json({ error: "Invalid time range or date value" });
  }

  const formattedTime = chartTime.toLocaleString("sv-SE").replace("T", " ");

  console.log("Sensor:", sensor);
  console.log("Formatted time:", formattedTime);
  console.log("SQL Query Params:", [sensor, formattedTime]);
  const query = `
    SELECT ?? AS value, Timestamp
    FROM sensor_data
    WHERE Timestamp >= ?
    ORDER BY Timestamp ASC
  `;

  try {
    const [results] = await pool.query(query, [sensor, formattedTime]);
    res.json(results);
  } catch (err) {
    console.error("Database query error:", err);
    res.status(500).send("Database error");
  }
});

module.exports = router;
