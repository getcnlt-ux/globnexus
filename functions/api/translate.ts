interface Env {
  GEMINI_API_KEY?: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  try {
    const apiKey = context.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY is not configured in Cloudflare environment variables." }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { text, targetLang } = await context.request.json() as { text: string; targetLang: string };

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: text }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.1
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `Gemini API returned error: ${response.status}`, details: errText }), {
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await response.json() as any;
    const translatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ translated: translatedText.trim() }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
