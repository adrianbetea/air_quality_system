const axios = require("axios");
const pool = require("./database");
const env = require("../../env.js");

const SERVER_URL = env.SERVER_URL;

async function saveSensorData() {
  try {
    const response = await axios.get(SERVER_URL);
    const data = response.data;

    const now = new Date();
    now.setHours(now.getHours() + 3);
    const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

    const query = `
      INSERT INTO sensor_data (MQ2, MQ5, MQ135, DustDensity, Temperature, Humidity, Timestamp) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    const values = [
      data.MQ2,
      data.MQ5,
      data.MQ135,
      data.DustDensity,
      data.Temperature,
      data.Humidity,
      timestamp,
    ];

    await pool.query(query, values);
    console.log("Datele au fost salvate în baza de date!");
  } catch (error) {
    console.error("Eroare la salvarea automată:", error.message);
  }
}

module.exports = saveSensorData;
