const express = require("express")
const router = express.Router()
const pool = require("../db")
const auth = require("../middleware/auth")
const jwt = require("jsonwebtoken")

// Helper function to get exercises for a routine (handles both old and new table structure)
const getRoutineExercises = async (routineId) => {
  try {
    // Try new table first
    const newTableResult = await pool.query(
      "SELECT * FROM routine_exercises WHERE routine_id = $1 ORDER BY exercise_order",
      [routineId],
    )

    if (newTableResult.rows.length > 0) {
      return newTableResult.rows
    }

    // Fallback to old table
    const oldTableResult = await pool.query("SELECT * FROM exercises WHERE routine_id = $1 ORDER BY exercise_order", [
      routineId,
    ])

    return oldTableResult.rows
  } catch (error) {
    console.error("Error fetching routine exercises:", error)
    return []
  }
}

// Get all routines with ratings (show all routines now)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, 
             COUNT(DISTINCT s.user_id) as saves_count,
             COALESCE(AVG(rt.rating), 0) as average_rating,
             COUNT(DISTINCT rt.user_id) as rating_count,
             COUNT(DISTINCT c.id) as comment_count
      FROM routines r
      LEFT JOIN saved_routines s ON r.id = s.routine_id
      LEFT JOIN ratings rt ON r.id = rt.routine_id
      LEFT JOIN comments c ON r.id = c.routine_id
      GROUP BY r.id
      ORDER BY r.created_at DESC
    `)

    // Get exercises for each routine
    const routinesWithExercises = await Promise.all(
      result.rows.map(async (routine) => {
        const exercises = await getRoutineExercises(routine.id)
        return {
          ...routine,
          exercises,
          average_rating: Number.parseFloat(routine.average_rating).toFixed(1),
        }
      }),
    )

    res.json(routinesWithExercises)
  } catch (error) {
    console.error("Error fetching routines:", error)
    res.status(500).json({ error: "Failed to fetch routines" })
  }
})

// Get user's saved routines
router.get("/saved", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT r.*, 
             COUNT(DISTINCT s.user_id) as saves_count,
             COALESCE(AVG(rt.rating), 0) as average_rating,
             COUNT(DISTINCT rt.user_id) as rating_count
      FROM routines r
      INNER JOIN saved_routines sr ON r.id = sr.routine_id
      LEFT JOIN saved_routines s ON r.id = s.routine_id
      LEFT JOIN ratings rt ON r.id = rt.routine_id
      WHERE sr.user_id = $1
      GROUP BY r.id, sr.created_at
      ORDER BY sr.created_at DESC
    `,
      [req.user.id],
    )

    // Get exercises for each routine
    const routinesWithExercises = await Promise.all(
      result.rows.map(async (routine) => {
        const exercises = await getRoutineExercises(routine.id)
        return {
          ...routine,
          exercises,
          average_rating: Number.parseFloat(routine.average_rating).toFixed(1),
        }
      }),
    )

    res.json(routinesWithExercises)
  } catch (error) {
    console.error("Error fetching saved routines:", error)
    res.status(500).json({ error: "Failed to fetch saved routines" })
  }
})

// Get routine by ID with ratings and comments
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params
    const token = req.headers["x-auth-token"]
    let userId = null

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        userId = decoded.user.id
      } catch (err) {
        // Token invalid, continue without user
      }
    }

    // Get routine details
    const routineResult = await pool.query(
      `
      SELECT r.*, 
             COUNT(DISTINCT s.user_id) as saves_count,
             COALESCE(AVG(rt.rating), 0) as average_rating,
             COUNT(DISTINCT rt.user_id) as rating_count,
             COUNT(DISTINCT c.id) as comment_count,
             ${userId ? `CASE WHEN user_saves.id IS NOT NULL THEN true ELSE false END as isSaved` : "false as isSaved"}
      FROM routines r
      LEFT JOIN saved_routines s ON r.id = s.routine_id
      LEFT JOIN ratings rt ON r.id = rt.routine_id
      LEFT JOIN comments c ON r.id = c.routine_id
      ${userId ? `LEFT JOIN saved_routines user_saves ON r.id = user_saves.routine_id AND user_saves.user_id = $2` : ""}
      WHERE r.id = $1
      GROUP BY r.id${userId ? ", user_saves.id" : ""}
    `,
      userId ? [id, userId] : [id],
    )

    if (routineResult.rows.length === 0) {
      return res.status(404).json({ error: "Routine not found" })
    }

    // Get exercises for this routine
    const exercises = await getRoutineExercises(req.params.id)

    // Get comments for this routine
    const commentsResult = await pool.query(
      `SELECT c.*, u.name as user_name 
       FROM comments c 
       JOIN users u ON c.user_id = u.id 
       WHERE c.routine_id = $1 
       ORDER BY c.created_at DESC`,
      [req.params.id],
    )

    const routine = {
      ...routineResult.rows[0],
      exercises,
      comments: commentsResult.rows,
      average_rating: Number.parseFloat(routineResult.rows[0].average_rating).toFixed(1),
    }

    res.json(routine)
  } catch (error) {
    console.error("Error fetching routine:", error)
    res.status(500).json({ error: "Failed to fetch routine" })
  }
})

// Create new routine (simplified - always public now)
router.post("/create", auth, async (req, res) => {
  try {
    const { title, description, category, difficulty, duration, exercises } = req.body

    // Check if the new columns exist, if not, use old structure
    const columnsExist = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'routines' 
      AND column_name IN ('created_by', 'is_public')
    `)

    const hasNewColumns = columnsExist.rows.length === 2

    let routineResult
    if (hasNewColumns) {
      // Use new structure - always set as public
      routineResult = await pool.query(
        `INSERT INTO routines (title, description, category, difficulty, duration, created_by, is_public)
         VALUES ($1, $2, $3, $4, $5, $6, true)
         RETURNING id`,
        [title, description, category, difficulty, duration, req.user.id],
      )
    } else {
      // Use old structure
      routineResult = await pool.query(
        `INSERT INTO routines (title, description, category, difficulty, duration)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [title, description, category, difficulty, duration],
      )
    }

    const routineId = routineResult.rows[0].id

    // Check which exercises table to use
    const routineExercisesExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'routine_exercises'
      )
    `)

    // Insert exercises
    for (const exercise of exercises) {
      if (routineExercisesExists.rows[0].exists) {
        // Use new table
        await pool.query(
          `INSERT INTO routine_exercises (routine_id, name, duration, rest, exercise_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [routineId, exercise.name, exercise.duration, exercise.rest, exercise.exercise_order],
        )
      } else {
        // Use old table
        await pool.query(
          `INSERT INTO exercises (routine_id, name, duration, rest, exercise_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [routineId, exercise.name, exercise.duration, exercise.rest, exercise.exercise_order],
        )
      }
    }

    res.json({ id: routineId, message: "Routine created successfully" })
  } catch (error) {
    console.error("Error creating routine:", error)
    res.status(500).json({ error: "Failed to create routine" })
  }
})

// Create new routine (legacy endpoint)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, difficulty, duration, category, exercises } = req.body

    // Start a transaction
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      // Insert routine
      const routineResult = await client.query(
        `INSERT INTO routines (title, description, difficulty, duration, category, creator_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [title, description, difficulty, duration, category, req.user.id],
      )

      // Insert exercises
      for (let i = 0; i < exercises.length; i++) {
        const exercise = exercises[i]
        await client.query(
          `INSERT INTO exercises (routine_id, name, duration, rest, exercise_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [routineResult.rows[0].id, exercise.name, exercise.duration, exercise.rest, i],
        )
      }

      await client.query("COMMIT")
      res.status(201).json(routineResult.rows[0])
    } catch (error) {
      await client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  } catch (error) {
    console.error("Error creating routine:", error)
    res.status(500).json({ error: "Failed to create routine" })
  }
})

// Save/Unsave routine
router.post("/:id/save", auth, async (req, res) => {
  try {
    const { id } = req.params

    const existingSave = await pool.query("SELECT * FROM saved_routines WHERE user_id = $1 AND routine_id = $2", [
      req.user.id,
      id,
    ])

    if (existingSave.rows.length > 0) {
      await pool.query("DELETE FROM saved_routines WHERE user_id = $1 AND routine_id = $2", [req.user.id, id])
      res.json({ message: "Routine unsaved" })
    } else {
      await pool.query("INSERT INTO saved_routines (user_id, routine_id) VALUES ($1, $2)", [req.user.id, id])
      res.json({ message: "Routine saved" })
    }
  } catch (error) {
    console.error("Error toggling save:", error)
    res.status(500).json({ error: "Failed to toggle save" })
  }
})

// Rate routine
router.post("/:id/rate", auth, async (req, res) => {
  try {
    const { id } = req.params
    const { rating } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" })
    }

    // Upsert rating
    await pool.query(
      `INSERT INTO ratings (user_id, routine_id, rating) 
       VALUES ($1, $2, $3) 
       ON CONFLICT (user_id, routine_id) 
       DO UPDATE SET rating = $3, updated_at = NOW()`,
      [req.user.id, id, rating],
    )

    res.json({ message: "Rating saved successfully" })
  } catch (error) {
    console.error("Error saving rating:", error)
    res.status(500).json({ error: "Failed to save rating" })
  }
})

// Add comment
router.post("/:id/comment", auth, async (req, res) => {
  try {
    const { id } = req.params
    const { comment } = req.body

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ error: "Comment cannot be empty" })
    }

    const result = await pool.query(
      `INSERT INTO comments (user_id, routine_id, comment) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [req.user.id, id, comment.trim()],
    )

    // Get user name for the response
    const userResult = await pool.query("SELECT name FROM users WHERE id = $1", [req.user.id])

    res.json({
      ...result.rows[0],
      user_name: userResult.rows[0].name,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    res.status(500).json({ error: "Failed to add comment" })
  }
})

// Log workout session
router.post("/:id/complete", auth, async (req, res) => {
  try {
    const { id } = req.params
    const { duration_minutes, notes } = req.body

    // Get user profile for calorie calculation
    const userResult = await pool.query(
      "SELECT weight_kg, height_cm, age, gender, activity_level FROM users WHERE id = $1",
      [req.user.id],
    )

    const user = userResult.rows[0]

    // Calculate calories burned (simplified formula)
    let calories_burned = 0
    if (user.weight_kg) {
      // Basic formula: METs * weight_kg * duration_hours
      // Assuming moderate intensity workout (6 METs)
      const mets = 6
      const duration_hours = duration_minutes / 60
      calories_burned = Math.round(mets * user.weight_kg * duration_hours)
    } else {
      // Fallback calculation if no weight data
      calories_burned = Math.round(duration_minutes * 5) // ~5 calories per minute
    }

    // Log workout session
    await pool.query(
      `INSERT INTO workout_sessions (user_id, routine_id, duration_minutes, calories_burned, notes) 
       VALUES ($1, $2, $3, $4, $5)`,
      [req.user.id, id, duration_minutes, calories_burned, notes || null],
    )

    res.json({
      message: "Workout completed successfully",
      calories_burned,
      duration_minutes,
    })
  } catch (error) {
    console.error("Error logging workout:", error)
    res.status(500).json({ error: "Failed to log workout" })
  }
})

// Get user's workout stats
router.get("/stats/user", auth, async (req, res) => {
  try {
    const { period = "week" } = req.query

    let dateFilter = "completed_at >= NOW() - INTERVAL '7 days'"
    if (period === "month") {
      dateFilter = "completed_at >= NOW() - INTERVAL '30 days'"
    }

    const result = await pool.query(
      `SELECT 
         COUNT(*) as total_workouts,
         SUM(duration_minutes) as total_minutes,
         SUM(calories_burned) as total_calories,
         AVG(duration_minutes) as avg_duration
       FROM workout_sessions 
       WHERE user_id = $1 AND ${dateFilter}`,
      [req.user.id],
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error("Error fetching workout stats:", error)
    res.status(500).json({ error: "Failed to fetch workout stats" })
  }
})

module.exports = router
