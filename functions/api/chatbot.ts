interface Env {
  GEMINI_API_KEY?: string;
}

type PagesFunction<T = any> = (context: {
  request: Request;
  env: T;
  next: () => Promise<Response>;
  data: any;
}) => Promise<Response>;

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

    const { messages, rates } = await context.request.json() as { messages: any[]; rates: any[] };

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
   - 상단 메뉴 of "신청하기 (Apply)" 메뉴에서 간편하고 상세하게 맞춤 신청서를 작성하면, 담당 매니저가 무료 밀착 견적을 산출하여 실시간 알림을 보냅니다.
5. Logistics Tracking (실시간 배송조회):
   - 상단 메뉴 of "배송조회 (Tracking)" 탭에 본인의 화물 운송장 번호나 인콰이어리 ID를 입력하여 즉시 위치를 파악할 수 있습니다.

Formatting & Tone Guidelines:
- Write in elegant, clear, structured Korean (or English if the user writes in English).
- Use list, bold terms, and beautiful unicode icons where relevant to make the text beautiful and fast to read.
- Be extremely polite, professional, and business-focused.
- Keep the response concise enough for real-time mobile/desktop chat windows (typically 2-4 structured paragraphs, no longer than 250 words unless highly specific details are requested).`;

    const prompt = `The customer is chatting with the support system. Here is the entire recent conversation history with this customer (oldest first, with the latest message at the very end):

${historyText}

Please reply to the customer's last message as the "Global Nexis Smart AI Support AI". Respond with high professionalism, in the same language of the last message. If the user greets you, introduce yourself with a premium greeting. Write ONLY your next reply message. Do not quote yourself or include prefixes like "AI Robot:" or anything else in the start of the text.`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: systemInstruction }] },
        generationConfig: {
          temperature: 0.3
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
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ reply: reply.trim() }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
