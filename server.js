const express = require("express");
const fetch   = require("node-fetch");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 3000;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

app.use(express.json({ limit: "25mb" }));

// ── Serve the tracker HTML at root ──
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "mda-tracker.html"));
});

// ── Anthropic proxy ──
app.post("/api/analyze", async (req, res) => {
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured in Render environment variables" });
  }
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":        "application/json",
        "x-api-key":           ANTHROPIC_KEY,
        "anthropic-version":   "2023-06-01",
        "anthropic-beta":      "pdfs-2024-09-25"
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`MDA Tracker on port ${PORT}`));
