import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { initializeApp } from 'firebase/app';
import { initializeFirestore, collection as fsCollection, doc as fsDoc, getDoc as fsGetDoc, setDoc as fsSetDoc, addDoc as fsAddDoc, updateDoc as fsUpdateDoc, deleteDoc as fsDeleteDoc, getDocs as fsGetDocs, query as fsQuery, where as fsWhere, orderBy as fsOrderBy, limit as fsLimit, serverTimestamp as fsServerTimestamp } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword as nodeSignIn, createUserWithEmailAndPassword as nodeCreateUser, sendSignInLinkToEmail as nodeSendLink, signInWithEmailLink as nodeSignInLink } from 'firebase/auth';
import { initializeApp as initializeAdminApp } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore, FieldValue as AdminFieldValue } from 'firebase-admin/firestore';
import fs from 'fs';

dotenv.config();

// Initialize Firebase on Server
let firebaseApp: any;
let serverDb: any;
let serverAuth: any;
let useAdminSdk = false;
let firestoreConfig: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    firestoreConfig = config;
    firebaseApp = initializeApp(config);
    serverAuth = getAuth(firebaseApp);

    // Use Client SDK with API key to bypass cross-project IAM limitations of Cloud Run service account
    if (config.firestoreDatabaseId) {
      serverDb = initializeFirestore(firebaseApp, {}, config.firestoreDatabaseId);
    } else {
      serverDb = initializeFirestore(firebaseApp, {});
    }
    useAdminSdk = false;
    console.log("Server: Firebase Client SDK initialized successfully for Firestore (database: " + (config.firestoreDatabaseId || 'default') + ")");
  } else {
    console.warn("Server: firebase-applet-config.json not found");
  }
} catch (error) {
  console.error("Server: Failed to initialize Firebase on server:", error);
}

// Helpers for Firestore REST API
function fromFirestoreValue(value: any): any {
  if (!value) return null;
  const types = ['stringValue', 'doubleValue', 'integerValue', 'booleanValue', 'timestampValue', 'nullValue', 'bytesValue', 'referenceValue', 'geoPointValue', 'arrayValue', 'mapValue'];
  for (const t of types) {
    if (t in value) {
      if (t === 'nullValue') return null;
      if (t === 'integerValue') return parseInt(value[t], 10);
      if (t === 'doubleValue') return parseFloat(value[t]);
      if (t === 'arrayValue') {
        const values = value[t].values || [];
        return values.map((val: any) => fromFirestoreValue(val));
      }
      if (t === 'mapValue') {
        const fields = value[t].fields || {};
        const obj: any = {};
        for (const k of Object.keys(fields)) {
          obj[k] = fromFirestoreValue(fields[k]);
        }
        return obj;
      }
      return value[t];
    }
  }
  return value;
}

function fromFirestoreFields(fields: any): any {
  const obj: any = {};
  if (!fields) return obj;
  for (const k of Object.keys(fields)) {
    obj[k] = fromFirestoreValue(fields[k]);
  }
  return obj;
}

function toFirestoreValue(value: any): any {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() };
    }
    return { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(val => toFirestoreValue(val))
      }
    };
  }
  if (typeof value === 'object') {
    const fields: any = {};
    for (const k of Object.keys(value)) {
      fields[k] = toFirestoreValue(value[k]);
    }
    return {
      mapValue: { fields }
    };
  }
  return { stringValue: String(value) };
}

function toFirestoreFields(obj: any): any {
  const fields: any = {};
  if (!obj) return fields;
  for (const k of Object.keys(obj)) {
    if (k === 'id') continue;
    fields[k] = toFirestoreValue(obj[k]);
  }
  return fields;
}

function applyInMemoryQuery(docs: any[], constraints: any[]): any[] {
  let result = [...docs];

  if (!constraints || !Array.isArray(constraints)) return result;

  for (const c of constraints) {
    if (c.type === 'where') {
      const { fieldPath, opStr, value } = c;
      result = result.filter(doc => {
        const val = doc[fieldPath];
        if (opStr === '==') {
          return val === value;
        } else if (opStr === '!=') {
          return val !== value;
        } else if (opStr === '<') {
          return val < value;
        } else if (opStr === '<=') {
          return val <= value;
        } else if (opStr === '>') {
          return val > value;
        } else if (opStr === '>=') {
          return val >= value;
        } else if (opStr === 'array-contains') {
          return Array.isArray(val) && val.includes(value);
        } else if (opStr === 'in') {
          return Array.isArray(value) && value.includes(val);
        } else if (opStr === 'not-in') {
          return Array.isArray(value) && !value.includes(val);
        }
        return true;
      });
    }
  }

  // Handle orderBy
  for (const c of constraints) {
    if (c.type === 'orderBy') {
      const { fieldPath, directionStr } = c;
      const isDesc = directionStr === 'desc';
      result.sort((a, b) => {
        const valA = a[fieldPath];
        const valB = b[fieldPath];
        if (valA === undefined || valA === null) return isDesc ? 1 : -1;
        if (valB === undefined || valB === null) return isDesc ? -1 : 1;
        if (valA < valB) return isDesc ? 1 : -1;
        if (valA > valB) return isDesc ? -1 : 1;
        return 0;
      });
    }
  }

  // Handle limit
  for (const c of constraints) {
    if (c.type === 'limit') {
      result = result.slice(0, Number(c.limitNum));
    }
  }

  return result;
}

function processServerTimestamps(data: any): any {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => processServerTimestamps(item));
  }
  if (typeof data === 'object') {
    const copy = { ...data };
    for (const key of Object.keys(copy)) {
      if (copy[key] === '__SERVER_TIMESTAMP__') {
        copy[key] = useAdminSdk 
          ? AdminFieldValue.serverTimestamp()
          : fsServerTimestamp();
      } else if (typeof copy[key] === 'object') {
        copy[key] = processServerTimestamps(copy[key]);
      }
    }
    return copy;
  }
  return data;
}

// Create Gemini client dynamically with lazy capability check
let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable is not configured on the server.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Fail-safe helper function to generate content with automatic retries and model fallbacks (e.g. handling 503 UNAVAILABLE or peak spikes)
async function generateContentWithFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getAiClient();
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

    try {
      // Validate that GEMINI_API_KEY is configured
      getAiClient();

      // Normalize target lang (e.g. ko-KR -> ko, zh-tw -> zh-tw)
      const matchedLang = (targetLang || "en").toLowerCase();
      let langKey = matchedLang;
      if (matchedLang.startsWith("ko")) langKey = "ko";
      else if (matchedLang.startsWith("en")) langKey = "en";
      else if (matchedLang.startsWith("zh")) {
        langKey = matchedLang.includes("tw") || matchedLang.includes("hk") ? "zh-TW" : "zh-CN";
      }
      else if (matchedLang.startsWith("ja")) langKey = "ja";

      const languageMap: Record<string, string> = {
        ko: "Korean",
        en: "English",
        zh: "Chinese (Simplified)",
        "zh-CN": "Chinese (Simplified)",
        "zh-TW": "Chinese (Traditional)",
        ja: "Japanese"
      };

      const langName = languageMap[langKey] || targetLang || "English";

      const systemInstruction = `You are a highly accurate real-time logistics chat translator.

Your single task is to translate the user's input text to the requested target language: "${langName}".

Strict Guidelines:
1. Translate the input text directly and naturally into ${langName}.
2. If the input text is already in ${langName} (or extremely similar), translate it to:
   - "English" (if ${langName} is "Korean")
   - "Korean" (if ${langName} is "English", "Chinese (Simplified)", "Chinese (Traditional)", or "Japanese")
3. Always preserve technical logistics codes, tracking numbers, container IDs, vessel/ship names, or URLs exactly without modification.
4. Maintain a helpful and polite professional tone.
5. Provide ONLY the final translated text. Do not include any explanations, introduction, markdown quotes, formatting, or translation prefixes.`;

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
      console.error("Translation error at /api/translate:", err);
      res.status(500).json({ error: err.message || "Failed to translate" });
    }
  });

  // API Route for AI Chatbot response
  app.post("/api/chatbot", async (req, res) => {
    const { messages, rates } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    try {
      getAiClient(); // Ensure API key is configured

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

  // DB & AUTH PROXY API ENDPOINTS (For GFW Bypass / Global Access)
  
  // 1. getDoc
  app.post("/api/db/getDoc", async (req, res) => {
    const { path: docPath, id } = req.body;
    try {
      if (!firestoreConfig) throw new Error("Firebase configuration not found.");
      const { projectId, apiKey, firestoreDatabaseId } = firestoreConfig;
      const dbId = firestoreDatabaseId || "(default)";
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/${docPath}/${id}?key=${apiKey}`;
      
      const fetchRes = await fetch(url);
      if (fetchRes.status === 404) {
        return res.json({ id, exists: false });
      }
      if (!fetchRes.ok) {
        const errorText = await fetchRes.text();
        throw new Error(`Firestore REST API error: ${errorText}`);
      }
      const docJson = await fetchRes.json();
      const data = fromFirestoreFields(docJson.fields);
      res.json({ id, exists: true, data });
    } catch (err: any) {
      console.error("getDoc error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 2. getDocs
  app.post("/api/db/getDocs", async (req, res) => {
    const { path: collectionPath, constraints } = req.body;
    try {
      if (!firestoreConfig) throw new Error("Firebase configuration not found.");
      const { projectId, apiKey, firestoreDatabaseId } = firestoreConfig;
      const dbId = firestoreDatabaseId || "(default)";
      
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/${collectionPath}?key=${apiKey}`;
      const fetchRes = await fetch(url);
      
      if (fetchRes.status === 404) {
        return res.json({ docs: [] });
      }
      if (!fetchRes.ok) {
        const errorText = await fetchRes.text();
        throw new Error(`Firestore REST API error: ${errorText}`);
      }
      
      const resJson = await fetchRes.json();
      const rawDocs = resJson.documents || [];
      
      let docs = rawDocs.map((doc: any) => {
        const nameParts = doc.name.split('/');
        const id = nameParts[nameParts.length - 1];
        return {
          id,
          ...fromFirestoreFields(doc.fields)
        };
      });

      docs = applyInMemoryQuery(docs, constraints);
      res.json({ docs });
    } catch (err: any) {
      console.error("getDocs error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3. addDoc
  app.post("/api/db/addDoc", async (req, res) => {
    const { path: collectionPath, data } = req.body;
    try {
      if (!firestoreConfig) throw new Error("Firebase configuration not found.");
      const { projectId, apiKey, firestoreDatabaseId } = firestoreConfig;
      const dbId = firestoreDatabaseId || "(default)";
      const processedData = processServerTimestamps(data);
      
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/${collectionPath}?key=${apiKey}`;
      
      const fetchRes = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: toFirestoreFields(processedData)
        })
      });
      
      if (!fetchRes.ok) {
        const errorText = await fetchRes.text();
        throw new Error(`Firestore REST API error: ${errorText}`);
      }
      
      const createdDoc = await fetchRes.json();
      const nameParts = createdDoc.name.split('/');
      const docId = nameParts[nameParts.length - 1];
      
      res.json({ id: docId });
    } catch (err: any) {
      console.error("addDoc error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 4. setDoc
  app.post("/api/db/setDoc", async (req, res) => {
    const { path: docPath, id, data, options } = req.body;
    try {
      if (!firestoreConfig) throw new Error("Firebase configuration not found.");
      const { projectId, apiKey, firestoreDatabaseId } = firestoreConfig;
      const dbId = firestoreDatabaseId || "(default)";
      const processedData = processServerTimestamps(data);
      
      let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/${docPath}/${id}?key=${apiKey}`;
      for (const key of Object.keys(processedData)) {
        url += `&updateMask.fieldPaths=${key}`;
      }
      
      const fetchRes = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: toFirestoreFields(processedData)
        })
      });
      
      if (!fetchRes.ok) {
        const errorText = await fetchRes.text();
        throw new Error(`Firestore REST API error: ${errorText}`);
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("setDoc error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 5. updateDoc
  app.post("/api/db/updateDoc", async (req, res) => {
    const { path: docPath, id, data } = req.body;
    try {
      if (!firestoreConfig) throw new Error("Firebase configuration not found.");
      const { projectId, apiKey, firestoreDatabaseId } = firestoreConfig;
      const dbId = firestoreDatabaseId || "(default)";
      const processedData = processServerTimestamps(data);
      
      let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/${docPath}/${id}?key=${apiKey}`;
      for (const key of Object.keys(processedData)) {
        url += `&updateMask.fieldPaths=${key}`;
      }
      
      const fetchRes = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fields: toFirestoreFields(processedData)
        })
      });
      
      if (!fetchRes.ok) {
        const errorText = await fetchRes.text();
        throw new Error(`Firestore REST API error: ${errorText}`);
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("updateDoc error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 6. deleteDoc
  app.post("/api/db/deleteDoc", async (req, res) => {
    const { path: docPath, id } = req.body;
    try {
      if (!firestoreConfig) throw new Error("Firebase configuration not found.");
      const { projectId, apiKey, firestoreDatabaseId } = firestoreConfig;
      const dbId = firestoreDatabaseId || "(default)";
      
      const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/${dbId}/documents/${docPath}/${id}?key=${apiKey}`;
      
      const fetchRes = await fetch(url, {
        method: 'DELETE'
      });
      
      if (!fetchRes.ok && fetchRes.status !== 404) {
        const errorText = await fetchRes.text();
        throw new Error(`Firestore REST API error: ${errorText}`);
      }
      
      res.json({ success: true });
    } catch (err: any) {
      console.error("deleteDoc error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Auth SignUp
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!serverAuth) throw new Error("Firebase Auth is not initialized on the server.");
      const userCredential = await nodeCreateUser(serverAuth, email, password);
      const user = userCredential.user;
      res.json({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0]
        }
      });
    } catch (err: any) {
      console.error("signup error:", err);
      res.status(400).json({ error: err.message, code: err.code });
    }
  });

  // 8. Auth SignIn
  app.post("/api/auth/signin", async (req, res) => {
    const { email, password } = req.body;
    try {
      if (!serverAuth) throw new Error("Firebase Auth is not initialized on the server.");
      const userCredential = await nodeSignIn(serverAuth, email, password);
      const user = userCredential.user;
      res.json({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0]
        }
      });
    } catch (err: any) {
      console.error("signin error:", err);
      res.status(400).json({ error: err.message, code: err.code });
    }
  });

  // 9. Auth sendSignInLink
  app.post("/api/auth/sendSignInLink", async (req, res) => {
    const { email, actionCodeSettings } = req.body;
    try {
      if (!serverAuth) throw new Error("Firebase Auth is not initialized on the server.");
      await nodeSendLink(serverAuth, email, actionCodeSettings);
      res.json({ success: true });
    } catch (err: any) {
      console.error("sendSignInLink error:", err);
      res.status(400).json({ error: err.message, code: err.code });
    }
  });

  // 10. Auth signInWithLink
  app.post("/api/auth/signInWithLink", async (req, res) => {
    const { email, link } = req.body;
    try {
      if (!serverAuth) throw new Error("Firebase Auth is not initialized on the server.");
      const userCredential = await nodeSignInLink(serverAuth, email, link);
      const user = userCredential.user;
      res.json({
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || email.split('@')[0]
        }
      });
    } catch (err: any) {
      console.error("signInWithLink error:", err);
      res.status(400).json({ error: err.message, code: err.code });
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
