import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// Create Gemini client with lazy capability check
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey ? new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
}) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for translation
  app.post("/api/translate", async (req, res) => {
    const { text, targetLang } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    try {
      const languageMap: Record<string, string> = {
        ko: "Korean",
        en: "English",
        zh: "Chinese (Simplified)",
        ja: "Japanese"
      };

      const langName = languageMap[targetLang] || targetLang || "English";

      const prompt = `You are a logistics expert and real-time support chat translator. Please translate the following client/agent message into ${langName}. Preserve technical logistical terms and any numbers (like tracking IDs, ship names, container numbers) exactly.
Maintain the exact emotional tone (professional, polite, helpful).
Return ONLY the translated text. Do not add any introductory text, quotes, explanations, markdown, or notes.

Message to translate:
${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const translated = response.text || "";
      res.json({ translated: translated.trim() });
    } catch (err: any) {
      console.error("Translation error:", err);
      res.status(500).json({ error: err.message || "Failed to translate" });
    }
  });

  // Handle Vite middleware in development or static files in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
