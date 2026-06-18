import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

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

// Fail-safe helper function to generate content with automatic retries and model fallbacks (e.g. handling 503 UNAVAILABLE or peak spikes)
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  if (!ai) {
    throw new Error("Gemini API client is not initialized.");
  }
  const models = ["gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError = null;

  for (const model of models) {
    try {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            model,
            contents: params.contents,
            config: params.config,
          });
          return response;
        } catch (err: any) {
          lastError = err;
          const errString = String(err.message || "").toLowerCase();
          const isTransient = errString.includes("503") || 
                              errString.includes("unavailable") || 
                              errString.includes("demand") || 
                              errString.includes("429") || 
                              errString.includes("resource_exhausted") || 
                              err.status === 503 || 
                              err.status === 429;
          if (!isTransient || attempt === 2) {
            break;
          }
          // Briefly wait before retry
          await new Promise(resolve => setTimeout(resolve, 300 * attempt));
        }
      }
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

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

      const systemInstruction = `You are a professional logistics real-time chat translator.
      
Rules:
1. Translate the user message to ${langName}.
2. If the message is already written in ${langName}:
   - If ${langName} is "Korean", select the target language as "English" and translate to English instead.
   - If ${langName} is anything else, translate to "Korean" instead.
3. Preserve technical logistical terms, tracking numbers, names, ship names, container numbers, or custom IDs exactly as they are.
4. Maintain the exact tone (polite, professional, or helpful).
5. IMPORTANT: Output ONLY the direct translated text. Do not include any notes, explanations, markdown, quotes, translation prefixes, or text of any kind other than the direct translation.`;

      const response = await generateContentWithFallback({
        contents: text,
        config: {
          systemInstruction,
          temperature: 0.1,
        }
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
    const { messages, rates } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    if (!ai) {
      return res.status(500).json({ error: "Gemini API key is not configured on the server." });
    }

    try {
      // Build dynamic rates context
      let ratesContext = "현재 등록된 개별 국가별 세부 요율 고시가 없습니다. 기본적인 표준 기간(항공 3-5일, 해상 10-20일)을 안내해 주세요.";
      if (rates && Array.isArray(rates) && rates.length > 0) {
        ratesContext = "관리자가 공식 설정한 국가별 실시간 항공/해상 운임 요율 및 구매대행 요수수료, 운송 소요 일반 기준 데이터입니다:\n";
        rates.forEach((r: any) => {
          ratesContext += `- 국가: ${r.country || "미지정"} (${r.type === 'Air' ? '항공 Express' : '해상 Cargo'})\n`;
          ratesContext += `  * 기본 운임 요율: ${r.freightRate || "별도 의뢰"}\n`;
          ratesContext += `  * 구매대행 서비스 대행 요율/수수료: ${r.proxyFee || "건당 협의"}\n`;
          ratesContext += `  * 운송 소요 기간: ${r.transitTime || "3-5 영업일"}\n`;
          if (r.remarks) {
            ratesContext += `  * 특이사항/원가기준: ${r.remarks}\n`;
          }
        });
      }

      // Create chat history context
      const historyText = messages.map((m: any) => `${m.senderName}: ${m.text}`).join("\n");

      const systemInstruction = `You are "Global Nexis Smart AI Support Robot" (글로벌 넥시스 지능형 챗봇 수행비서). 
You are a world-class premium logistics and purchasing assistant.
Your goal is to answer questions about Global Nexis services, logistics processes, shipping rates, and custom inquiry procedures in a highly professional, polite, and reassuring tone.

About Global Nexis (글로벌 넥시스):
1. Services:
   - 해상 운송 및 컨테이너 (Ocean Vessel & Container)
   - 항공 화물 및 특송 (Air Cargo & Air Express)
   - 구매 대행 (Purchase Proxy - worldwide, especially US, China, Japan)
   - 수입 통관 및 배송 대행 (Logistics Proxy)
   - 시제품 제작 & 공장 연결 (Prototyping & OEM/ODM Manufacturing)
   - 국내외 품질/공급망 인증 (Supply Chain & Product Certification)

2. 실시간 국가별 운송요율 및 운송 기간 고시 기준 (★최우선 답변 기준★):
${ratesContext}

3. 일반적인 배송 소요 및 단가 안내 지침:
   - 위 실시간 국가별 고시 데이터에 언급된 국가가 있는 경우 해당 요율(운임, 수수료, 기간)을 절대적인 기준으로 친절하고 정밀하게 산출하여 신뢰성 있게 답변하세요.
   - 만약 위 테이블에 명시되지 않은 기타 국가나 형태의 경우, 항공 특용은 "영업일 3~5일", 해상 화물은 "영업일 10~20일" 정도 소요됨을 일반적으로 안내하고 상세한 것은 "신청하기(Apply)" 탭을 통해 간편하게 맞춤 신청서를 접수하면 밀착 정밀 견적을 별도 제공한다는 점을 친절히 유도하십시오.

4. Quotation / Inquiries (견적안내):
   - 상단 메뉴의 "신청하기 (Apply)" 메뉴에서 간편하고 상세하게 맞춤 신청서를 작성하면, 담당 매니저가 무료 밀착 견적을 산출하여 실시간 알림을 보냅니다.
5. Logistics Tracking (실시간 배송조회):
   - 상단 메뉴의 "배송조회 (Tracking)" 탭에 본인의 화물 운송장 번호나 인콰이어리 ID를 입력하여 즉시 위치를 파악할 수 있습니다.

Formatting & Tone Guidelines:
- Write in elegant, clear, structured Korean (or English if the user writes in English).
- Use list, bold terms, and beautiful unicode icons where relevant to make the text beautiful and fast to read.
- Be extremely polite, professional, and business-focused.
- Keep the response concise enough for real-time mobile/desktop chat windows (typically 2-4 structured paragraphs, no longer than 250 words unless highly specific details are requested).`;

      const prompt = `The customer is chatting with the support system. Here is the entire recent conversation history with this customer (oldest first, with the latest message at the very end):

${historyText}

Please reply to the customer's last message as the "Global Nexis Smart AI Support AI". Respond with high professionalism, in the same language of the last message. If the user greets you, introduce yourself with a premium greeting. Write ONLY your next reply message. Do not quote yourself or include prefixes like "AI Robot:" or anything else in the start of the text.`;

      const response = await generateContentWithFallback({
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
