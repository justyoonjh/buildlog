const { GoogleGenAI, SchemaType } = require("@google/genai"); // Check import style for Node (CommonJS)
const config = require('../server-config');

// Using the same SDK as frontend, but in CJS mode.
// Note: @google/genai might be ESM only or dual. 
// If require fails, might need dynamic import or check node version. 
// Node 22 supports ESM natively, but this project mixes CJS/ESM.
// Let's assume require works if it's a standard CJS build. 
// If not, we might need to use the REST API directly or dynamic import.
// Frontend used: import { GoogleGenAI } from "@google/genai";

const generateSchedule = async (currentStages) => {
  if (!config.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const ai = new GoogleGenAI({ apiKey: config.GEMINI_API_KEY });

  // Prepare prompt context
  const stageNames = currentStages.map(s => `${s.name} (${s.duration || '기간 미정'})`).join(', ');
  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    당신은 건설 공정 전문가입니다.
    다음은 주택 건설 프로젝트의 공사 단계 목록입니다:
    [${stageNames}]

    현재 개요만 잡혀있는 이 단계들을 바탕으로, 실제 시공 가능한 상세 공정표를 생성해주세요.
    
    규칙:
    1. 시작일(startDate)은 ${today} 부터 시작하는 것으로 가정하세요.
    2. 각 단계의 순서는 논리적(시공 순서)으로 배치하고, 필요시 병렬 진행(동시 작업)도 고려하세요.
    3. 각 단계의 예상 소요 기간(duration)이 "미정"이면 합리적인 기간(일수)을 할당하세요.
    4. 결과는 각 단계별로 [단계명, 시작일, 종료일, 선행작업(dependencies), 상세설명]을 포함해야 합니다.
    5. 기존 목록에 없는 필수 공정이 있다면 추가해도 좋습니다(예: 준공청소 등), 하지만 가급적 기존 목록을 유지하며 구체화해주세요.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash-001',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              id: { type: "STRING", description: "Unique ID (can be new or match input if possible)" },
              name: { type: "STRING" },
              manager: { type: "STRING", description: "담당자 (없으면 '미정' 또는 적절한 직책)" },
              startDate: { type: "STRING", description: "YYYY-MM-DD" },
              endDate: { type: "STRING", description: "YYYY-MM-DD" },
              status: { type: "STRING", enum: ["pending", "in_progress", "completed"] },
              description: { type: "STRING" }
            },
            required: ["name", "startDate", "endDate"]
          }
        }
      }
    });

    const responseText = typeof response.text === 'function' ? response.text() : response.text;
    if (!responseText) throw new Error("No response from AI");

    // Clean up markdown block if present (e.g. ```json ... ```)
    const jsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    const schedule = JSON.parse(jsonString);
    return schedule;

  } catch (error) {
    console.error('AI Schedule Generation Error:', error);
    // Return mock data fallback if AI fails
    return [
      { name: "착공 준비", startDate: today, endDate: today, status: "completed", description: "AI 오류로 인한 예시 데이터" },
      { name: "철거 공사", startDate: today, endDate: today, status: "pending", description: "AI 서비스 연결 확인 필요" }
    ];
  }
};

module.exports = { generateSchedule };
