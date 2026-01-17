const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ API Key not found");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
  try {
    // Note: listModels is not directly exposed on GoogleGenerativeAI instance in some versions?
    // Actually it is usually accessible via a ModelManager if available, but the SDK structure changed.
    // Let's try to just test a few common ones if list isn't easily available or try to find the list endpoint.
    // The node SDK usually doesn't have a simple 'listModels' method on the client root like python.
    // But we can try 'gemini-pro' and 'gemini-1.0-pro' etc.

    // Changing approach: Test multiple known model names.
    const candidates = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-1.0-pro"
    ];

    console.log("🔄 Checking model availability...");

    for (const modelName of candidates) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello");
        const response = await result.response;
        console.log(`✅ ${modelName}: Available (Response: ${response.text().slice(0, 20)}...)`);
      } catch (e) {
        console.log(`❌ ${modelName}: Failed`);
        console.error(JSON.stringify(e, null, 2)); // Print full error structure
      }
    }

  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
