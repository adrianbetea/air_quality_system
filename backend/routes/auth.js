const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("./database");

// REGISTER
router.post("/register", async (req, res) => {
  const { username, password, email, phone } = req.body;

  if (!username || !password || !email || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (username, email, phone, password) VALUES (?, ?, ?, ?)",
      [username, email, phone, hashedPassword]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      res
        .status(409)
        .json({ message: "Username, Email or Phone already exists" });
    } else {
      res.status(500).json({ message: "Server error", error });
    }
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    if (rows.length === 0)
      return res.status(404).json({ message: "Email not found" });

    const valid = await bcrypt.compare(password, rows[0].password);
    if (!valid) return res.status(401).json({ message: "Invalid password" });

    res.json({
      message: "Login successful",
      username: rows[0].username,
      user_id: rows[0].user_id,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
});

// routes/users.js sau direct într-un controller
router.post("/save-push-token", async (req, res) => {
  const { userId, expoPushToken } = req.body;

  if (!userId || !expoPushToken) {
    return res.status(400).json({ message: "Missing fields" });
  }

  await pool.query(`UPDATE users SET expo_push_token = ? WHERE user_id = ?`, [
    expoPushToken,
    userId,
  ]);

  res.json({ success: true });
});

module.exports = router;
