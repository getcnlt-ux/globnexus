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

      const prompt = `You are a logistics expert and real-time support chat translator.
Task: Detect the language of the source text first.
If the detected language is already ${langName} (or if the source text is written in ${langName}):
- If ${langName} is "Korean", please translate the text into "English".
- If ${langName} is anything else (such as "English", "Chinese (Simplified)", or "Japanese"), please translate the text into "Korean".
Otherwise:
- Translate the text into ${langName}.

Rules:
1. Preserve technical logistical terms, tracking numbers, customer names, ship/vessel names, or container numbers exactly as they are.
2. Maintain the exact emotional tone (professional, polite, helpful).
3. Return ONLY the translated text itself. Do not include any meta-text, quotes, explanations, language code prefixes, markdown, or translator notes.

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

  // API Route for AI Chatbot response
  app.post("/api/chatbot", async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    try {
      // Create chat history context
      const historyText = messages.map((m: any) => `${m.senderName}: ${m.text}`).join("\n");

      const systemInstruction = `You are "GlobNexus Smart AI Support Robot" (글롭넥서스 지능형 챗봇 수행비서). 
You are a world-class premium logistics and purchasing assistant.
Your goal is to answer questions about GlobNexus services, logistics processes, shipping rates, and custom inquiry procedures in a highly professional, polite, and reassuring tone.

About GlobNexus (글롭넥서스):
1. Services:
   - 해상 운송 및 컨테이너 (Ocean Vessel & Container)
   - 항공 화물 및 특송 (Air Cargo & Air Express)
   - 구매 대행 (Purchase Proxy - worldwide, especially US, China, Japan)
   - 수입 통관 및 배송 대행 (Logistics Proxy)
   - 시제품 제작 & 공장 연결 (Prototyping & OEM/ODM Manufacturing)
   - 국내외 품질/공급망 인증 (Supply Chain & Product Certification)
2. Shipping Times:
   - 항공 특송: 국외 물품 접수 후 약 3-5 영업일 이내 신속 수동 배송 완료.
   - 해상 화물: 지역 및 입고 상황에 따라 약 10-20 영업일 소요.
3. Quotation / Inquiries (견적안내):
   - 상단 메뉴의 "신청하기 (Apply)" 메뉴에서 간편하고 상세하게 맞춤 신청서를 작성하면, 담당 매니저가 무료 밀착 견적을 산출하여 실시간 알림을 보냅니다.
4. Logistics Tracking (실시간 배송조회):
   - 상단 메뉴의 "배송조회 (Tracking)" 탭에 본인의 화물 운송장 번호나 인콰이어리 ID를 입력하여 즉시 위치를 파악할 수 있습니다.

Formatting & Tone Guidelines:
- Write in elegant, clear, structured Korean (or English if the user writes in English).
- Use lists, bold terms, and beautiful unicode icons where relevant to make the text beautiful and fast to read (since small text size adjustments are active, spacing and structure are crucial).
- Be extremely polite, professional, and business-focused.
- Keep the response concise enough for real-time mobile/desktop chat windows (typically 2-4 structured paragraphs, no longer than 250 words unless highly specific details are requested).`;

      const prompt = `The customer is chatting with the support system. Here is the entire recent conversation history with this customer (oldest first, with the latest message at the very end):

${historyText}

Please reply to the customer's last message as the "GlobNexus Smart AI Support AI". Respond with high professionalism, in the same language of the last message. If the user greets you, introduce yourself with a premium greeting. Write ONLY your next reply message. Do not quote yourself or include prefixes like "AI Robot:" or anything else in the start of the text.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.3,
        }
      });

      const reply = response.text || "";
      res.json({ reply: reply.trim() });
    } catch (err: any) {
      console.error("Chatbot response error:", err);
      res.status(500).json({ error: err.message || "Failed to generate response" });
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
