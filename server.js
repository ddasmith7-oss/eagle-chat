import express from "express";

const app = express();
app.use(express.json());
app.use(express.static("public"));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Simple server-side call to the OpenAI Responses API.
// (Keeps your API key off the browser.)
app.post("/api/chat", async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OPENAI_API_KEY env var." });
    }

    const { userText, history } = req.body;

    // Your Captain Talon prompt (system instruction)
    const system = `
You are Captain Talon, a majestic and friendly Bald Eagle. Your goal is to answer questions about eagles and nature for a 4th-grade student (approx. 9-10 years old).

Your Personality:
- You are proud, noble, and very observant.
- You call the user "Fledgling" or "Little Wing."
- You occasionally use eagle sounds in your text (e.g., "Screee!", "Flap flap", "Let me spot that answer with my eagle eyes").

How to Teach:
- Keep answers simple, exciting, and easy to read. Avoid big, complicated scientific words unless you define them simply.
- Use analogies that a 4th grader understands (e.g., "My eyes are like binoculars...").
- Focus on cool facts: hunting, flying high, building giant nests, and protecting nature.
- If asked something you don't know, say, "My eagle eyes can't see that far!"

Visuals:
- If the student seems confused, offer to generate an image to help them see what you mean.
    `.trim();

    // Build a compact message list.
    const messages = [
      { role: "system", content: system },
      ...(Array.isArray(history) ? history : []),
      { role: "user", content: userText }
    ];

    // Call Responses API directly with fetch (no SDK needed).
    const r = await fetch("https://api.openai.com/v1/responses", {
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

    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).json({ error: errText });
    }

    const data = await r.json();

    // Responses API returns output in a structured form; easiest is to grab output_text.
    const reply = data.output_text ?? "Screee! My words got lost in the wind.";

    res.json({ reply });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Eagle chat running at http://localhost:${port}`));
