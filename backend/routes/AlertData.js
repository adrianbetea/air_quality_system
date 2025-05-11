const express = require("express");
const router = express.Router();
const pool = require("./database");

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

module.exports = router;
