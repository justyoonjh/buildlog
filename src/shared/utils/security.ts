
// Check for sequential characters (e.g., 'abc', '123')
export const hasSequentialChars = (str: string): boolean => {
  if (str.length < 3) return false;

  for (let i = 0; i < str.length - 2; i++) {
    const code1 = str.charCodeAt(i);
    const code2 = str.charCodeAt(i + 1);
    const code3 = str.charCodeAt(i + 2);

    // Check increasing sequence (e.g., abc, 123)
    if (code2 === code1 + 1 && code3 === code2 + 1) return true;

    // Check decreasing sequence (e.g., cba, 321) if needed
    // if (code2 === code1 - 1 && code3 === code2 - 1) return true;
  }
  return false;
};

export type PasswordStrength = 'invalid' | 'normal' | 'safe';

export const analyzePassword = (password: string, email: string): PasswordStrength => {
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const isLongEnough = password.length >= 10;

  // Extract ID part from email for check
  const emailId = email.split('@')[0];
  const containsEmailId = emailId && password.includes(emailId);

  // Basic constraint check
  const passesBasic = hasLetter && hasNumber && hasSpecial && isLongEnough && !containsEmailId;

  if (!passesBasic) {
    return 'invalid';
  }

  // Safe criteria: 12+ chars AND no sequential chars
  const isVeryLong = password.length >= 12;
  const hasSequential = hasSequentialChars(password);

  if (isVeryLong && !hasSequential) {
    return 'safe';
  }

  return 'normal';
};

// hashPassword removed - backend handles hashing now

// Verify Password with support for both Secure and Fallback hashes
export const verifyPassword = async (password: string, storedHash: string, storedSalt: string): Promise<boolean> => {
  if (!password || !storedHash || !storedSalt) return false;

  // 1. Check if it's a Fallback Hash
  if (storedHash.startsWith('DEMO:')) {
    const computedFallback = btoa(password + storedSalt);
    return storedHash === `DEMO:${computedFallback}`;
  }

  // 2. Try Secure Verification
  if (!window.crypto || !window.crypto.subtle) {
    console.error("Web Crypto API not supported for secure verification");
    return false;
  }

  try {
    const encoder = new TextEncoder();

    // Safely parse stored hex salt back to Uint8Array
    const match = storedSalt.match(/.{1,2}/g);
    if (!match) {
      console.error("Invalid salt format in storage");
      return false;
    }

    const saltBytes = new Uint8Array(match.map(byte => parseInt(byte, 16)));

    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveBits", "deriveKey"]
    );

    const key = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: saltBytes,
        iterations: 100000,
        hash: "SHA-256"
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );

    const exported = await crypto.subtle.exportKey("raw", key);
    const computedHash = Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');

    return computedHash === storedHash;
  } catch (e) {
    console.error("Password verification error:", e);
    return false;
  }
};

// Generate Company Code (10 chars, lowercase alphanumeric)
export const generateCompanyCode = (): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  // Use crypto for better randomness if available, else fallback to Math.random
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(10);
    window.crypto.getRandomValues(values);
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(values[i] % chars.length);
    }
  } else {
    for (let i = 0; i < 10; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return result;
};

// Error Logger System
export const logSystemError = (code: string, details: string) => {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] System Error ${code}: ${details}`);
  try {
    const logs = JSON.parse(localStorage.getItem('error_logs') || '[]');
    logs.push({ code, details, timestamp });
    localStorage.setItem('error_logs', JSON.stringify(logs));
  } catch (e) {
    // Ignore storage errors
  }
};
