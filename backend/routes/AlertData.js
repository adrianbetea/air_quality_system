const express = require("express");
const router = express.Router();
const processAlerts = require("./alertProcess");
const pool = require("./database");
const cron = require("node-cron");

SERVER_URL = "http://192.168.0.105";

router.post("/create-alert", async (req, res) => {
  const {
    user_id,
    alert_name,
    alert_description,
    sensor_name,
    sensor_alert_value,
    comparison_operator,
    notification_check,
    email_check,
    phone_check,
  } = req.body;

  if (
    !user_id ||
    !alert_name ||
    !sensor_name ||
    sensor_alert_value == null ||
    !comparison_operator
  ) {
    return res.status(400).json({ message: "Date lipsa alerta." });
  }

  try {
    const now = new Date();
    now.setHours(now.getHours() + 3); // UTC+3 pentru România
    const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

    const [result] = await pool.query(
      `INSERT INTO alerts
        (alert_name, alert_description, user_id, sensor_name, sensor_alert_value, date_added, comparison_operator, notification_check, email_check, phone_check)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        alert_name,
        alert_description,
        user_id,
        sensor_name,
        sensor_alert_value,
        timestamp,
        comparison_operator,
        notification_check,
        email_check,
        phone_check,
      ]
    );

    res.status(201).json({
      message: "Alerta creata cu succes.",
      id_alert: result.insertId,
    });
  } catch (error) {
    console.error("Eroare la crearea alertei: ", error);
    res.status(500).json({ message: "eroare interna." });
  }
});

router.delete("/delete-alert", async (req, res) => {
  try {
    const alertId = req.query.id_alert;
    console.log("Recived id_alert", alertId);
    if (!alertId) {
      return res.status(400).json({ message: "Missing id_alert" });
    }

    await pool.query(`DELETE FROM alert_triggers WHERE id_alert = ?`, [
      alertId,
    ]);

    await pool.query(`DELETE FROM alerts WHERE id_alert = ?`, [alertId]);
    return res
      .status(200)
      .json({ message: "Alert and its triggers deleted successfully." });
  } catch (error) {
    console.error("Error deleting alert:", error);
    return res
      .status(500)
      .json({ message: "Server error while deleting alert and triggers." });
  }
});

router.put("/update-alert", async (req, res) => {
  try {
    const { id_alert, new_value } = req.body;
    if (!id_alert || new_value === undefined) {
      return res.status(400).json({ message: "Missing id_alert or new_value" });
    }

    await pool.query(
      "UPDATE alerts SET sensor_alert_value = ? WHERE id_alert = ?",
      [new_value, id_alert]
    );
    return res.status(200).json({ message: "Alert updated successfully" });
  } catch (error) {
    console.error("Error updating alert:", error);
    return res
      .status(500)
      .json({ message: "Server error while updating alert" });
  }
});

router.get("/fetch-data", async (req, res) => {
  const userId = req.query.user_id;
  try {
    const [rows] = await pool.query("SELECT * FROM alerts WHERE user_id = ?", [
      userId,
    ]);

    res.json(rows);
  } catch (error) {
    console.error("Error fetching alerts:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.get("/fetch-triggered-alerts", async (req, res) => {
  const idAlert = req.query.alert_id;
  try {
    const [rows] = await pool.query(
      `SELECT *
       FROM alert_triggers
       WHERE id_alert = ?`,
      [idAlert]
    );
    console.log(rows);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching triggered alerts:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

router.post("/process-alerts", async (req, res) => {
  try {
    const updatedData = await processAlerts();
    res.json({
      message: "Verificare completă, alert_triggers actualizat",
      dateleActualizate: updatedData,
    });
  } catch (error) {
    res.status(500).json({
      message: "Eroare internă la procesarea alertelor",
      dateleActualizate: updatedData,
    });
  }
});
router.put("/update-checks", async (req, res) => {
  const { user_id, id_alert, notification_check, email_check, phone_check } =
    req.body;
  try {
    await pool.query(
      `UPDATE alerts SET 
        notification_check = ?, 
        email_check = ?, 
        phone_check = ? 
      WHERE id_alert = ? AND user_id = ?`,
      [notification_check, email_check, phone_check, id_alert, user_id]
    );

    res.json({ message: "Alertele au fost actualizate cu succes." });
  } catch (error) {
    console.error("Eroare la actualizarea alertelor:", error);
    res.status(500).json({ message: "Eroare la server." });
  }
});

router.get("/get-checks", async (req, res) => {
  const { user_id, id_alert } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT notification_check, email_check, phone_check 
       FROM alerts 
       WHERE user_id = ? AND id_alert = ?`,
      [user_id, id_alert]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Alertă inexistentă." });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Eroare la get-checks:", error);
    res.status(500).json({ message: "Eroare server." });
  }
});

module.exports = router;
