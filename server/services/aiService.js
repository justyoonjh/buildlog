const { GoogleGenerativeAI } = require("@google/generative-ai");
const config = require('../server-config');

const generateSchedule = async (currentStages) => {
  if (!config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(config.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    systemInstruction: "당신은 건설 공정 전문가입니다. 주어진 정보를 바탕으로 논리적인 상세 공정표를 생성하세요."
  });

  // Prepare prompt context
  const stageNames = currentStages.map(s => `${s.name} (${s.duration || '기간 미정'})`).join(', ');
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    다음은 주택 건설 프로젝트의 공사 단계 목록입니다:
    [${stageNames}]

    현재 개요만 잡혀있는 이 단계들을 바탕으로, 실제 시공 가능한 상세 공정표를 생성해주세요.
    
    규칙:
    1. 시작일(startDate)은 ${today} 부터 시작하는 것으로 가정하세요.
    2. 각 단계의 순서는 논리적(시공 순서)으로 배치하고, 필요시 병렬 진행(동시 작업)도 고려하세요.
    3. 각 단계의 예상 소요 기간(duration)이 "미정"이면 합리적인 기간(일수)을 할당하세요.
    4. 결과는 각 단계별로 [단계명, 시작일, 종료일, 선행작업(dependencies), 상세설명]을 포함해야 합니다.
    5. 기존 목록에 없는 필수 공정이 있다면 추가해도 좋습니다(예: 준공청소 등), 하지만 가급적 기존 목록을 유지하며 구체화해주세요.
    
    Output Format: JSON Array ONLY
    Example:
    [
      { "name": "...", "startDate": "YYYY-MM-DD", "endDate": "YYYY-MM-DD", "status": "pending", "description": "..." }
    ]
  `;

  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    });

    const response = await result.response;
    const text = response.text();

    if (!text) throw new Error("No response from AI");

    return JSON.parse(text);

  } catch (error) {
    console.error('AI Schedule Generation Error:', error);
    // Return mock data fallback if AI fails
    return [
      { name: "착공 준비", startDate: today, endDate: today, status: "completed", description: "AI 오류로 인한 예시 데이터 (Fallback)" },
      { name: "철거 공사", startDate: today, endDate: today, status: "pending", description: "AI 서비스 연결 확인 필요" }
    ];
  }
};

module.exports = { generateSchedule };
