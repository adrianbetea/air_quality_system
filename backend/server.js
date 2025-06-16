const express = require("express");
axios = require("axios");
const pool = require("./routes/database");
const cron = require("node-cron");
const nodemailer = require("nodemailer");
const processAlerts = require("./routes/alertProcess");
const saveSensorData = require("./routes/saveSensorData");

const sensorDataRoute = require("./routes/SensorData");
const authRoute = require("./routes/auth");
const filterSensorDataRoute = require("./routes/FilterSensorData");
const alertDataRoute = require("./routes/AlertData");
const env = require("./../env.js");

const app = express();
const PORT = 3000;

const BASE_URL = env.BASE_URL;

app.use(express.json());
app.use("/sensor", sensorDataRoute);
app.use("/auth", authRoute);
app.use("/filter", filterSensorDataRoute);
app.use("/alert", alertDataRoute);

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
  cron.schedule("*/10 * * * * *", async () => {
    try {
      await saveSensorData();
      await processAlerts();
    } catch (err) {}
  });
});
