require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 3001,
  JUSO: {
    API_KEY: 'devU01TX0FVVEgyMDI1MTEyNTAwNDA1MTExNjQ4OTY=',
    API_URL: 'https://business.juso.go.kr/addrlink/addrLinkApi.do'
  },
  NTS: {
    // Default key from user request if env var is missing
    API_KEY: process.env.NTS_API_KEY || "eba26431906495f0fee56a259ec7e6071dbf531539f00be7cf604a65f492fcf5",
    STATUS_URL: 'https://api.odcloud.kr/api/nts-businessman/v1/status',
    VALIDATE_URL: 'https://api.odcloud.kr/api/nts-businessman/v1/validate'
  },
  DB: {
    FILE_PATH: './data/users.json'
  },
  AUTH: {
    SALT_ROUNDS: 10000, // PBKDF2 iterations
    KEY_LENGTH: 64,
    DIGEST: 'sha512'
  }
};
