require('dotenv').config();
const { z } = require('zod');

// Define validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  SESSION_SECRET: z.string().min(1, 'SESSION_SECRET is required'),
  JUSO_API_KEY: z.string().optional(), // Using optional to prevent startup crash if not set, but warned below
  NTS_API_KEY: z.string().min(1, 'NTS_API_KEY is required'),
  GEMINI_API_KEY: z.string().optional(), // Use optional to avoid crash if not using AI features immediately
});

// Validate process.env
const env = envSchema.safeParse(process.env);

if (!env.success) {
  console.error('❌ Invalid environment variables:', env.error.format());
  // process.exit(1); // Optional: Crash server on invalid env
}

const config = env.data || process.env; // Fallback if parse fails (though valid keys are usually preferred)

// Warn specifically for JUSO key if missing (optional logic)
if (!config.JUSO_API_KEY) {
  console.warn('⚠️ JUSO_API_KEY is missing. Address search may not work.');
}

module.exports = {
  NODE_ENV: config.NODE_ENV,
  PORT: config.PORT,
  SESSION_SECRET: config.SESSION_SECRET,
  GEMINI_API_KEY: config.GEMINI_API_KEY || config.VITE_GEMINI_API_KEY || '', // Fallback to VITE_ key if shared .env
  JUSO: {
    API_KEY: config.JUSO_API_KEY || '',
    API_URL: 'https://business.juso.go.kr/addrlink/addrLinkApi.do'
  },
  NTS: {
    API_KEY: config.NTS_API_KEY || '',
    STATUS_URL: 'https://api.odcloud.kr/api/nts-businessman/v1/status',
    VALIDATE_URL: 'https://api.odcloud.kr/api/nts-businessman/v1/validate'
  },
  DB: {
    FILE_PATH: './data/users.json'
  }
};
