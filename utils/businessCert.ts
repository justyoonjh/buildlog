import { GoogleGenAI, Type } from "@google/genai";

export interface BusinessInfo {
  b_no: string;
  s_nm: string;
  start_dt: string;
  w_kind: string;
  c_nm: string; // Representative Name
}

// SECURITY NOTE: In a production environment, API keys should be stored in environment variables
// and API calls should be proxied through a backend server to prevent exposing the key to the client.
const NTS_API_KEY = process.env.NTS_API_KEY || "eba26431906495f0fee56a259ec7e6071dbf531539f00be7cf604a65f492fcf5";

export const extractBusinessInfo = async (file: File): Promise<BusinessInfo> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");

  const ai = new GoogleGenAI({ apiKey });

  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present (e.g. "data:image/jpeg;base64,")
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType: file.type, data: base64Data } },
        { text: "사업자등록증에서 정보를 추출해주세요." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          b_no: { type: Type.STRING, description: "사업자등록번호 (숫자 10자리, 하이픈 제외)" },
          s_nm: { type: Type.STRING, description: "상호명" },
          c_nm: { type: Type.STRING, description: "성명(대표자명)" },
          start_dt: { type: Type.STRING, description: "개업일자 (YYYYMMDD 형식)" },
          w_kind: { type: Type.STRING, description: "업종 (사업의 종류 - 종목)" }
        },
        required: ["b_no", "s_nm", "c_nm", "start_dt", "w_kind"]
      },
      systemInstruction: `당신은 한국의 '사업자등록증' 이미지에서 핵심 정보를 추출하여 구조화된 데이터로 변환하는 전문 AI입니다.
      
      Rules:
      1. 이미지에서 정보를 찾을 수 없는 경우 해당 필드의 값은 null로 반환하세요.
      2. 'b_no'는 반드시 숫자만 남기세요. (예: 123-45-67890 -> 1234567890)
      3. 'start_dt'는 반드시 8자리 숫자로 변환하세요. (예: 2023년 05월 01일 -> 20230501)
      4. 상호명(법인명)을 정확히 찾아야 합니다.
      5. 사업의 종류-종목 란에 업종이 있습니다. 업종이 여러 개인 경우 맨 위 항목만 선택해주세요.`
    }
  });

  if (!response.text) throw new Error("AI 응답을 받을 수 없습니다.");
  
  return JSON.parse(response.text) as BusinessInfo;
};

export const validateBusinessWithNTS = async (b_no: string, start_dt: string, p_nm: string): Promise<boolean> => {
    // Using the NTS Public Data Portal API Key.
    const ntsKey = NTS_API_KEY;
    
    if (!ntsKey) {
        console.warn("NTS_API_KEY가 설정되지 않았습니다. 데모 목적으로 검증을 통과시킵니다.");
        return true; 
    }

    try {
        // 1. Status Check (휴/폐업 조회)
        // Endpoint: /status
        const statusRes = await fetch(`https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${ntsKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                "b_no": [b_no]
            })
        });

        if (!statusRes.ok) {
            throw new Error(`국세청 상태조회 API 호출 실패 (Status: ${statusRes.status})`);
        }

        const statusData = await statusRes.json();
        const statusItem = statusData.data?.[0];

        if (!statusItem) {
             throw new Error("사업자 상태 정보를 가져올 수 없습니다.");
        }

        // b_stt_cd: 01 (계속), 02 (휴업), 03 (폐업)
        if (statusItem.b_stt_cd === '02') {
            throw new Error("휴업 업체입니다. 서비스 가입이 불가능합니다.");
        } else if (statusItem.b_stt_cd === '03') {
             throw new Error("폐업 업체입니다. 서비스 가입이 불가능합니다.");
        } else if (statusItem.b_stt_cd !== '01') {
             throw new Error(`유효하지 않은 사업자 상태입니다: ${statusItem.b_stt}`);
        }

        // 2. Authenticity Verification (진위 확인)
        // Endpoint: /validate
        const validateRes = await fetch(`https://api.odcloud.kr/api/nts-businessman/v1/validate?serviceKey=${ntsKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                businesses: [
                    {
                        b_no: b_no,
                        start_dt: start_dt,
                        p_nm: p_nm
                    }
                ]
            })
        });

        if (!validateRes.ok) {
             throw new Error(`국세청 진위확인 API 호출 실패 (Status: ${validateRes.status})`);
        }
        
        const validateData = await validateRes.json();
        const validateItem = validateData.data?.[0];
        
        // valid: "01" (Valid), "02" (Invalid)
        if (validateItem && validateItem.valid === '01') {
            return true;
        } else {
            // If invalid, typically validateItem.valid_msg might exist, but we provide a generic secure message.
            throw new Error("국세청 등록 정보와 일치하지 않습니다. (사업자번호, 개업일자, 대표자명이 정확한지 확인해주세요)");
        }

    } catch (e: any) {
        console.error("NTS Validation Error:", e);
        // Propagate the specific error message to the UI
        throw e;
    }
}