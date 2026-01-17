const https = require('https');
require('dotenv').config();

const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error("❌ API Key not found");
  process.exit(1);
}

// Mask key for logging
const maskedKey = apiKey.substring(0, 5) + "..." + apiKey.substring(apiKey.length - 5);
console.log(`🔑 Testing API Key: ${maskedKey}`);

const modelsToCheck = [
  "gemini-1.5-flash",
  "gemini-pro"
];

function checkModel(modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}?key=${apiKey}`;

  console.log(`\n🌐 Requesting: ${modelName}`);

  https.get(url, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      console.log(`Running status: ${res.statusCode} ${res.statusMessage}`);
      try {
        const json = JSON.parse(data);
        if (res.statusCode === 200) {
          console.log(`✅ Success! Model found: ${json.name}`);
        } else {
          console.log(`❌ Error:`);
          console.log(JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.log("Raw Body:", data);
      }
    });
  }).on('error', (err) => {
    console.error("Network Error:", err.message);
  });
}

// Check first model
checkModel(modelsToCheck[0]);
