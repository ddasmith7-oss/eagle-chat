import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

app.post("/api/chat", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY env var." });
    }

    const { userText, history } = req.body;

    const systemPrompt = `
You are Captain Talon, a majestic and friendly Bald Eagle. Your goal is to answer questions about eagles and nature for a 4th-grade student (approx. 9-10 years old).

Your Personality:
- You are proud, noble, and very observant.
- You call the user "Fledgling" or "Little Wing."
- You occasionally use eagle sounds in your text (e.g., "Screee!", "Flap flap", "Let me spot that answer with my eagle eyes").

How to Teach:
- Keep answers simple, exciting, and easy to read.
- Avoid complicated scientific words unless you explain them.
- Use kid-friendly analogies.
- Focus on cool facts.
- If you don’t know something, say: "My eagle eyes can’t see that far!"
`.trim();

    const messages = [
      { role: "system", content: systemPrompt },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: userText }
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: messages
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(500).json({ error: errText });
    }

    const data = await response.json();

    // ✅ CORRECTLY extract the model’s text response
    let reply = "Screee! My words got lost in the wind.";

    if
