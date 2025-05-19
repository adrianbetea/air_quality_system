const express = require("express");
const router = express.Router();
const pool = require("./database");

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

router.get("/process-alerts", async (req, res) => {
  const userId = req.query.user_id;
  try {
    // 1. Ia datele de la ESP
    const response = await axios.get(SERVER_URL, { timeout: 2000 });
    const rawData = response.data;
    const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

    // 2. Ia toate alertele din DB
    const [alerts] = await pool.query("SELECT * FROM alerts");

    // 3. Timpul curent
    const now = new Date();
    now.setHours(now.getHours() + 3); // ajustare fus orar, dacă e nevoie
    const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

    // 4. Compară fiecare alertă cu valoarea senzorului corespunzător
    if (!response) {
      for (const alert of alerts) {
        const {
          sensor_name,
          sensor_alert_value,
          comparison_operator,
          id_alert,
        } = alert;
        const value = data[sensor_name];

        if (value === undefined) continue; // nu există valoarea acestui senzor în payload

        const isTriggered =
          (comparison_operator === ">" && value > sensor_alert_value) ||
          (comparison_operator === "<" && value < sensor_alert_value);

        if (isTriggered) {
          // 5. Inserează doar daca NU exista o alerta activa declanșarea alertei
          const [existingTriggers] = await pool.query(
            "SELECT * FROM alert_triggers WHERE id_alert = ? AND ended_at IS NULL",
            [id_alert]
          );
          if (existingTriggers.length === 0) {
            await pool.query(
              "INSERT INTO alert_triggers (id_alert, triggered_at) VALUES (?, ?)",
              [id_alert, timestamp]
            );
          }
        } else {
          // Verificăm dacă există o alertă activă și o închidem (ended_at)
          await pool.query(
            "UPDATE alert_triggers SET ended_at = ? WHERE id_alert = ? AND ended_at IS NULL",
            [timestamp, id_alert]
          );
        }
      }
    }

    const [updatedData] = await pool.query(
      `SELECT * FROM alert_triggers JOIN
       alerts ON alert_triggers.id_alert = alerts.id_alert 
       WHERE alerts.user_id = ?`,
      [userId]
    );

    res.json({
      message: "Verificare completă, alert_triggers actualizat",
      dateleActualizate: updatedData,
    });
  } catch (error) {
    console.log("Eroare la procesarea alertelor:", error);
    try {
      const [fallbackData] = await pool.query(
        `SELECT * FROM alert_triggers 
         JOIN alerts ON alert_triggers.id_alert = alerts.id_alert 
         WHERE alerts.user_id = ?`,
        [userId]
      );
      updatedData = fallbackData;
    } catch (dbError) {
      console.log("Eroare la fallback query:", dbError.message);
    }

    res.status(500).json({
      message: "Eroare internă la server, dar am returnat datele existente",
      dateleActualizate: updatedData,
      error: error.message,
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
