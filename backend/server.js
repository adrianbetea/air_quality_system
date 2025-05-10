const express = require("express");
axios = require("axios");
const pool = require("./routes/database");

const sensorDataRoute = require("./routes/SensorData");
const authRoute = require("./routes/auth");
const filterSensorDataRoute = require("./routes/FilterSensorData");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/sensor", sensorDataRoute);
app.use("/auth", authRoute);
app.use("/filter", filterSensorDataRoute);

app.listen(PORT, () => {
  console.log("Server is listening on port 3000");
});
