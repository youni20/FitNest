const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");
const bcrypt = require("bcryptjs");

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, fitness_goals, level, weight_kg, height_cm, age, gender, activity_level FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const {
      name,
      email,
      fitness_goals,
      level,
      weight_kg,
      height_cm,
      age,
      gender,
      activity_level,
    } = req.body;

    const result = await pool.query(
      `UPDATE users SET 
         name = $1, email = $2, fitness_goals = $3, level = $4, 
         weight_kg = $5, height_cm = $6, age = $7, gender = $8, activity_level = $9,
         updated_at = CURRENT_TIMESTAMP 
       WHERE id = $10 
       RETURNING id, name, email, fitness_goals, level, weight_kg, height_cm, age, gender, activity_level`,
      [
        name,
        email,
        fitness_goals,
        level,
        weight_kg,
        height_cm,
        age,
        gender,
        activity_level,
        req.user.id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters long" });
    }

    // Get current user with password
    const userResult = await pool.query(
      "SELECT id, password FROM users WHERE id = $1",
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    await pool.query(
      "UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
      [hashedNewPassword, req.user.id]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Delete account
router.delete("/delete-account", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    // Start a transaction to ensure all related data is deleted
    await pool.query("BEGIN");

    try {
      // Delete related data first (to avoid foreign key constraints)
      // Delete workout sessions
      await pool.query("DELETE FROM workout_sessions WHERE user_id = $1", [
        userId,
      ]);

      // Delete any other related data (add more as needed based on your schema)
      // await pool.query("DELETE FROM user_routines WHERE user_id = $1", [userId])
      // await pool.query("DELETE FROM user_achievements WHERE user_id = $1", [userId])

      // Finally delete the user
      const result = await pool.query(
        "DELETE FROM users WHERE id = $1 RETURNING id",
        [userId]
      );

      if (result.rows.length === 0) {
        await pool.query("ROLLBACK");
        return res.status(404).json({ error: "User not found" });
      }

      // Commit the transaction
      await pool.query("COMMIT");

      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      // Rollback on error
      await pool.query("ROLLBACK");
      throw error;
    }
  } catch (error) {
    console.error("Error deleting account:", error);
    res.status(500).json({ error: "Failed to delete account" });
  }
});

// Get workout history for reports
router.get("/workout-history", auth, async (req, res) => {
  try {
    const { period = "month" } = req.query;

    let dateFilter = "completed_at >= NOW() - INTERVAL '30 days'";
    if (period === "week") {
      dateFilter = "completed_at >= NOW() - INTERVAL '7 days'";
    } else if (period === "year") {
      dateFilter = "completed_at >= NOW() - INTERVAL '365 days'";
    }

    const result = await pool.query(
      `SELECT 
         ws.*,
         r.title as routine_title,
         r.category,
         r.difficulty,
         DATE(ws.completed_at) as workout_date
       FROM workout_sessions ws
       JOIN routines r ON ws.routine_id = r.id
       WHERE ws.user_id = $1 AND ${dateFilter}
       ORDER BY ws.completed_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching workout history:", error);
    res.status(500).json({ error: "Failed to fetch workout history" });
  }
});

module.exports = router;
