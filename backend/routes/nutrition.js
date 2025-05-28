// backend/routes/nutrition.js
const express = require("express")
const router = express.Router()
const pool = require("../db")
const auth = require("../middleware/auth")

// Get daily nutrition summary
router.get("/daily", auth, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query
    
    const result = await pool.query(
      `SELECT 
         COALESCE(SUM(calories), 0) as total_calories,
         COALESCE(SUM(protein), 0) as total_protein,
         COALESCE(SUM(carbs), 0) as total_carbs,
         COALESCE(SUM(fat), 0) as total_fat,
         COALESCE(SUM(fiber), 0) as total_fiber
       FROM nutrition_entries 
       WHERE user_id = $1 AND DATE(logged_at) = $2`,
      [req.user.id, date]
    )

    const entriesResult = await pool.query(
      `SELECT * FROM nutrition_entries 
       WHERE user_id = $1 AND DATE(logged_at) = $2 
       ORDER BY logged_at DESC`,
      [req.user.id, date]
    )

    res.json({
      ...result.rows[0],
      entries: entriesResult.rows
    })
  } catch (error) {
    console.error("Error fetching daily nutrition:", error)
    res.status(500).json({ error: "Failed to fetch nutrition data" })
  }
})

// Add nutrition entry
router.post("/entry", auth, async (req, res) => {
  try {
    const { food_name, quantity_grams, calories, protein, carbs, fat, fiber } = req.body

    const result = await pool.query(
      `INSERT INTO nutrition_entries (user_id, food_name, quantity_grams, calories, protein, carbs, fat, fiber)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [req.user.id, food_name, quantity_grams, calories, protein, carbs, fat, fiber]
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error adding nutrition entry:", error)
    res.status(500).json({ error: "Failed to add nutrition entry" })
  }
})

// Delete nutrition entry
router.delete("/entry/:id", auth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM nutrition_entries WHERE id = $1 AND user_id = $2",
      [req.params.id, req.user.id]
    )
    res.json({ message: "Entry deleted successfully" })
  } catch (error) {
    console.error("Error deleting nutrition entry:", error)
    res.status(500).json({ error: "Failed to delete entry" })
  }
})

module.exports = router