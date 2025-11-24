
// Check for sequential characters (e.g., 'abc', '123')
export const hasSequentialChars = (str: string): boolean => {
  if (str.length < 3) return false;
  
  for (let i = 0; i < str.length - 2; i++) {
    const code1 = str.charCodeAt(i);
    const code2 = str.charCodeAt(i + 1);
    const code3 = str.charCodeAt(i + 2);

    // Check increasing sequence (e.g., abc, 123)
    if (code2 === code1 + 1 && code3 === code2 + 1) return true;
    
    // Check decreasing sequence (e.g., cba, 321) if needed, but prompt usually implies simple sequences
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

// Simulate PBKDF2 Hashing
export const hashPassword = async (password: string): Promise<{ hash: string; salt: string }> => {
  const encoder = new TextEncoder();
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('');

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
  const hash = Array.from(new Uint8Array(exported)).map(b => b.toString(16).padStart(2, '0')).join('');

  return { hash, salt };
};

// Verify Password
export const verifyPassword = async (password: string, storedHash: string, storedSalt: string): Promise<boolean> => {
  const encoder = new TextEncoder();
  
  // Convert stored hex salt back to Uint8Array
  const saltBytes = new Uint8Array(storedSalt.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

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
};
