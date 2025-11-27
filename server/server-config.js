require('dotenv').config();

const requiredEnvVars = ['JUSO_API_KEY', 'NTS_API_KEY'];

requiredEnvVars.forEach((key) => {
  if (!process.env[key]) {
    console.error(`Error: Missing required environment variable ${key}`);
    // In production, you might want to exit here: process.exit(1);
  }
});

module.exports = {
  PORT: process.env.PORT || 3001,
  JUSO: {
    API_KEY: process.env.JUSO_API_KEY,
    API_URL: 'https://business.juso.go.kr/addrlink/addrLinkApi.do'
  },
  NTS: {
    API_KEY: process.env.NTS_API_KEY,
    STATUS_URL: 'https://api.odcloud.kr/api/nts-businessman/v1/status',
    VALIDATE_URL: 'https://api.odcloud.kr/api/nts-businessman/v1/validate'
  },
  DB: {
    FILE_PATH: './data/users.json'
  }
};
