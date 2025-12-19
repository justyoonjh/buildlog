import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ No VITE_GEMINI_API_KEY found in .env");
  process.exit(1);
}

console.log(`🔑 Using API Key: ${apiKey.substring(0, 10)}...`);

async function listModels() {
  try {
    const ai = new GoogleGenAI({ apiKey });
    // Attempt to list models. The method signature might vary if it's the new SDK.
    // Standard @google/generative-ai uses genAI.getGenerativeModel but listing is via fetch usually or model manager.
    // If this is the new @google/genai SDK, let's try to verify its capabilities.

    // Fallback using raw FETCH to be purely SDK-agnostic about 'listing' if SDK methods are obscure
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("\n📋 Compatible Models (generateContent):");
    if (data.models) {
      const compatible = data.models.filter(m =>
        m.supportedGenerationMethods?.includes('generateContent') &&
        !m.name.includes('embedding')
      );

      compatible.forEach(m => {
        console.log(m.name.replace('models/', ''));
      });

      if (compatible.length === 0) console.log("No compatible models found.");
    } else {
      console.log("No models found in response:", data);
    }

  } catch (error) {
    console.error("❌ Error listing models:", error);
  }
}

listModels();
