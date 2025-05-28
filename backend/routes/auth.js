const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");
const auth = require("../middleware/auth");

// Verify token route
router.get("/verify", auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, fitness_goals as "fitnessGoals", level FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if user exists
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length === 0) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Create JWT payload
    const payload = {
      id: user.id,
      email: user.email,
    };

    // Sign token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        fitnessGoals: user.fitness_goals,
        level: user.level,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Verify token route
router.get("/verify", auth, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, name, email, fitness_goals, level FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        fitnessGoals: user.fitness_goals,
        level: user.level,
      },
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Register route
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, fitnessGoals, level } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: "User already exists with this email" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (name, email, password, fitness_goals, level, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
       RETURNING id, name, email, fitness_goals, level`,
      [name, email, hashedPassword, fitnessGoals || [], level || "Beginner"]
    );

    const user = result.rows[0];

    // Create JWT payload
    const payload = {
      id: user.id,
      email: user.email,
    };

    // Sign token
    const token = jwt.sign(
      {
        id: result.rows[0].id,
        email: result.rows[0].email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Return user data and token
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        fitnessGoals: user.fitness_goals,
        level: user.level,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
