const axios = require("axios");
const pool = require("./database");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const nodemailer = require("nodemailer");
const twilio = require("twilio");
const env = require("../../env.js");

const MAIL_API = env.MAILTRAP_API;
const TWILIO_SID = env.TWILIO_SID;
const TWILIO_AUTH_TOKEN = env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = env.TWILIO_PHONE_NUMBER;
const SERVER_URL = env.SERVER_URL;

const client = twilio(TWILIO_SID, TWILIO_AUTH_TOKEN);

async function sendPushNotification(expoPushToken, title, body) {
  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: { screen: "AlertScreen" },
  };

  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-Encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });

  console.log("PUSH NOTIFICATION TRIMIS");
}

async function sendEmail(user_email, alert_name, sensor_value) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "beteaadrian03@gmail.com",
      pass: "egvkdwuvrdirrhmr",
    },
  });

  const info = await transporter.sendMail({
    from: "beteaadrian03@gmail.com",
    to: user_email,
    subject: `Alert Activated!!! ${alert_name}`,
    text: `${alert_name} activated, sensor value: ${sensor_value}`, // plain‑text body
  });
  console.log("MAIL TRIMIS!! la:", user_email);
}

async function sendSMS(user_phone, message) {
  try {
    const msg = await client.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: user_phone,
    });

    console.log(`SMS trimis către ${user_phone}: ${msg.sid}`);
  } catch (error) {
    console.error(`Eroare SMS către ${user_phone}:`, error.message);
  }
}

async function processAlerts() {
  try {
    // 1. Ia datele de la ESP
    const response = await axios.get(SERVER_URL, { timeout: 2000 });
    const rawData = response.data;
    const data = typeof rawData === "string" ? JSON.parse(rawData) : rawData;

    // 2. Ia toate alertele din DB
    const [alerts] = await pool.query("SELECT * FROM alerts");

    // 3. Timpul curent ajustat
    const now = new Date();
    now.setHours(now.getHours() + 3); // ajustare fus orar dacă e cazul
    const timestamp = now.toISOString().slice(0, 19).replace("T", " ");

    // 4. Iterăm prin alerte
    for (const alert of alerts) {
      const { sensor_name, sensor_alert_value, comparison_operator, id_alert } =
        alert;
      const value = data[sensor_name];

      if (value === undefined) continue; // nu există valoarea senzorului

      const isTriggered =
        (comparison_operator === ">" && value > sensor_alert_value) ||
        (comparison_operator === "<" && value < sensor_alert_value);

      if (isTriggered) {
        // verificăm dacă alerta nu e deja activă
        const [existingTriggers] = await pool.query(
          "SELECT * FROM alert_triggers WHERE id_alert = ? AND ended_at IS NULL",
          [id_alert]
        );
        if (existingTriggers.length === 0) {
          await pool.query(
            "INSERT INTO alert_triggers (id_alert, triggered_at) VALUES (?, ?)",
            [id_alert, timestamp]
          );

          const [notification_users] = await pool.query(
            `SELECT u.user_id, u.email, u.phone, u.expo_push_token FROM USERS u
            JOIN alerts a ON a.user_id = u.user_id
            JOIN alert_triggers at ON a.id_alert = at.id_alert 
            WHERE a.notification_check = 1 AND a.id_alert = ?
            `,
            [id_alert]
          );

          const [email_users] = await pool.query(
            `SELECT u.user_id, u.email, u.phone, u.expo_push_token FROM USERS u
            JOIN alerts a ON a.user_id = u.user_id
            JOIN alert_triggers at ON a.id_alert = at.id_alert 
            WHERE a.email_check = 1 AND a.id_alert = ?
            `,
            [id_alert]
          );

          const [sms_users] = await pool.query(
            `SELECT u.user_id, u.email, u.phone, u.expo_push_token FROM USERS u
            JOIN alerts a ON a.user_id = u.user_id
            JOIN alert_triggers at ON a.id_alert = at.id_alert 
            WHERE a.phone_check = 1 AND a.id_alert = ?
            `,
            [id_alert]
          );

          const notifiedTokens = new Set();

          for (const user of notification_users) {
            const token = user.expo_push_token;

            if (!token || notifiedTokens.has(token)) continue;
            await sendPushNotification(
              user.expo_push_token,
              `Alertă pentru ${sensor_name}`,
              `Valoare: ${value}, prag: ${comparison_operator} ${sensor_alert_value}`
            );
            notifiedTokens.add(token);
          }

          const emailTokens = new Set();

          for (const user of email_users) {
            const email = user.email;
            if (!email || emailTokens.has(email)) continue;

            const alert_name = `${sensor_name} ${comparison_operator} ${sensor_alert_value}`;
            await sendEmail(email, alert_name, value);

            emailTokens.add(email);
          }

          const smsSentNumbers = new Set();
          for (const user of sms_users) {
            const alrt_nm = `${sensor_name} ${comparison_operator} ${sensor_alert_value}`;
            const msg = `Alertă ${sensor_name}!\nValoare actuală: ${value}\nPrag: ${comparison_operator} ${sensor_alert_value}`;
            const phone = "+4" + user.phone;
            if (phone && !smsSentNumbers.has(phone)) {
              await sendSMS(phone, msg);
              smsSentNumbers.add(phone);
            }
          }
        }
      } else {
        // închidem alertele active care nu mai sunt declanșate
        await pool.query(
          "UPDATE alert_triggers SET ended_at = ? WHERE id_alert = ? AND ended_at IS NULL",
          [timestamp, id_alert]
        );
      }
    }

    // 5. Returnăm toate alertele active (fără user_id filtrare, ca să le vezi pe toate)
    const [updatedData] = await pool.query(
      `SELECT * FROM alert_triggers 
       JOIN alerts ON alert_triggers.id_alert = alerts.id_alert`
    );

    console.log("Alerts processed");
    return updatedData;
  } catch (error) {
    console.error("Eroare în processAlerts:", error);
    throw error;
  }
}

module.exports = processAlerts;
