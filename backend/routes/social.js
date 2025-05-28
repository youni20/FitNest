// backend/routes/social.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const auth = require("../middleware/auth");

// Search users
router.get("/search", auth, async (req, res) => {
  try {
    const { q } = req.query;

    const result = await pool.query(
      `SELECT id, name, email, level, fitness_goals 
       FROM users 
       WHERE (name ILIKE $1 OR email ILIKE $1) 
       AND id != $2 
       AND id NOT IN (
         SELECT friend_id FROM friendships WHERE user_id = $2
         UNION
         SELECT user_id FROM friendships WHERE friend_id = $2
       )
       LIMIT 20`,
      [`%${q}%`, req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ error: "Failed to search users" });
  }
});

// Get friends
router.get("/friends", auth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.id, f.friend_id, u.name as friend_name, u.level as friend_level, f.status, f.created_at
       FROM friendships f
       JOIN users u ON f.friend_id = u.id
       WHERE f.user_id = $1
       UNION
       SELECT f.id, f.user_id as friend_id, u.name as friend_name, u.level as friend_level, f.status, f.created_at
       FROM friendships f
       JOIN users u ON f.user_id = u.id
       WHERE f.friend_id = $1 AND f.status = 'accepted'
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ error: "Failed to fetch friends" });
  }
});

// Send friend request
router.post("/friend-request", auth, async (req, res) => {
  try {
    const { friend_id } = req.body;

    await pool.query(
      "INSERT INTO friendships (user_id, friend_id, status) VALUES ($1, $2, 'pending')",
      [req.user.id, friend_id]
    );

    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Failed to send friend request" });
  }
});

// Respond to friend request
router.put("/friend-request/:id", auth, async (req, res) => {
  try {
    const { accept } = req.body;
    const status = accept ? "accepted" : "declined";

    await pool.query(
      "UPDATE friendships SET status = $1, updated_at = NOW() WHERE id = $2",
      [status, req.params.id]
    );

    res.json({ message: `Friend request ${status}` });
  } catch (error) {
    console.error("Error responding to friend request:", error);
    res.status(500).json({ error: "Failed to respond to friend request" });
  }
});

router.get("/conversations", auth, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(
      `SELECT DISTINCT
         CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id 
           ELSE m.sender_id 
         END AS friend_id,
         u.name AS friend_name,
         (
           SELECT message FROM messages 
           WHERE (sender_id = $1 AND receiver_id = 
                    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
              OR (sender_id = 
                    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND receiver_id = $1)
           ORDER BY sent_at DESC
           LIMIT 1
         ) AS last_message,
         (
           SELECT sent_at FROM messages 
           WHERE (sender_id = $1 AND receiver_id = 
                    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END)
              OR (sender_id = 
                    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END AND receiver_id = $1)
           ORDER BY sent_at DESC
           LIMIT 1
         ) AS last_message_time,
         (
           SELECT COUNT(*) FROM messages 
           WHERE sender_id = 
                    CASE WHEN m.sender_id = $1 THEN m.receiver_id ELSE m.sender_id END
             AND receiver_id = $1
             AND is_read = false
         ) AS unread_count
       FROM messages m
       JOIN users u ON u.id = 
         CASE 
           WHEN m.sender_id = $1 THEN m.receiver_id 
           ELSE m.sender_id 
         END
       WHERE m.sender_id = $1 OR m.receiver_id = $1
       ORDER BY last_message_time DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching conversations:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
// Get messages with a friend
router.get("/messages/:friendId", auth, async (req, res) => {
  try {
    const { friendId } = req.params;

    // Mark messages as read
    await pool.query(
      "UPDATE messages SET is_read = true WHERE sender_id = $1 AND receiver_id = $2",
      [friendId, req.user.id]
    );

    const result = await pool.query(
      `SELECT m.*, u.name as sender_name
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE (m.sender_id = $1 AND m.receiver_id = $2) 
          OR (m.sender_id = $2 AND m.receiver_id = $1)
       ORDER BY m.sent_at ASC`,
      [req.user.id, friendId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send message
router.post("/message", auth, async (req, res) => {
  try {
    const { receiver_id, message } = req.body;

    const result = await pool.query(
      `INSERT INTO messages (sender_id, receiver_id, message)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, receiver_id, message]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;
