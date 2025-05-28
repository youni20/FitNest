const express = require("express")
const router = express.Router()
const { generateText } = require("ai")
const { openai } = require("@ai-sdk/openai")
const auth = require("../middleware/auth")

// Chat with AI
router.post("/chat", auth, async (req, res) => {
  try {
    const { message, context } = req.body

    if (!message) {
      return res.status(400).json({ error: "Message is required" })
    }

    const systemPrompt = `You are FitNest AI, a helpful fitness and wellness assistant. You provide expert advice on:
- Workout routines and exercise form
- Nutrition and meal planning
- Fitness goals and motivation
- Recovery and injury prevention
- General health and wellness

Keep responses concise (2-3 sentences max), encouraging, and practical. Always recommend consulting healthcare professionals for medical concerns.

User context: ${context || "General user"}`

    const { text } = await generateText({
      model: openai("gpt-3.5-turbo"),
      system: systemPrompt,
      prompt: message,
      maxTokens: 150,
      temperature: 0.7,
    })

    res.json({ response: text })
  } catch (error) {
    console.error("Error generating AI response:", error)
    res.status(500).json({ error: "Failed to generate response" })
  }
})

module.exports = router
