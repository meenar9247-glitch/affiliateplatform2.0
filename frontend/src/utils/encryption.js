import CryptoJS from 'crypto-js';

// ==================== Encryption Constants ====================

export const ENCRYPTION_ALGORITHMS = {
  AES: 'aes',
  DES: 'des',
  TRIPLE_DES: 'triple-des',
  RC4: 'rc4',
  RABBIT: 'rabbit',
  EVP_KDF: 'evp-kdf'
};

export const HASH_ALGORITHMS = {
  MD5: 'md5',
  SHA1: 'sha1',
  SHA256: 'sha256',
  SHA512: 'sha512',
  SHA3: 'sha3',
  RIPEMD160: 'ripemd160'
};

export const ENCODING_FORMATS = {
  BASE64: 'base64',
  HEX: 'hex',
  UTF8: 'utf8',
  LATIN1: 'latin1'
};

export const ENCRYPTION_STRENGTHS = {
  LOW: 128,
  MEDIUM: 192,
  HIGH: 256
};

export const KEY_DERIVATION_FUNCTIONS = {
  PBKDF2: 'pbkdf2',
  EVP_BYTES_TO_KEY: 'evp-bytes-to-key'
};

// Default encryption options
export const DEFAULT_ENCRYPTION_OPTIONS = {
  algorithm: ENCRYPTION_ALGORITHMS.AES,
  keySize: ENCRYPTION_STRENGTHS.HIGH / 32, // 256 bits = 8 words
  ivSize: 128 / 32, // 128 bits = 4 words
  iterations: 10000,
  salt: null,
  encoding: ENCODING_FORMATS.BASE64
};

// ==================== Core Encryption Functions ====================

export class EncryptionService {
  constructor(secretKey, options = {}) {
    this.secretKey = secretKey;
    this.options = {
      ...DEFAULT_ENCRYPTION_OPTIONS,
      ...options
    };
  }

  // Generate random salt
  generateSalt(length = 16) {
    return CryptoJS.lib.WordArray.random(length).toString();
  }

  // Generate random IV
  generateIV() {
    return CryptoJS.lib.WordArray.random(this.options.ivSize);
  }

  // Derive key using PBKDF2
  deriveKey(password, salt, iterations = this.options.iterations) {
    return CryptoJS.PBKDF2(password, salt, {
      keySize: this.options.keySize,
      iterations: iterations
    });
  }

  // Encrypt data
  encrypt(data, customOptions = {}) {
    try {
      const options = { ...this.options, ...customOptions };
      const salt = options.salt || this.generateSalt();
      const iv = this.generateIV();
      
      // Derive key
      const key = this.deriveKey(this.secretKey, salt, options.iterations);
      
      // Encrypt
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      // Combine salt, iv, and encrypted data
      const combined = CryptoJS.lib.WordArray.create()
        .concat(salt)
        .concat(iv)
        .concat(encrypted.ciphertext);
      
      return {
        success: true,
        data: combined.toString(CryptoJS.enc[options.encoding.toUpperCase()]),
        salt: salt.toString(),
        iv: iv.toString(),
        algorithm: options.algorithm,
        keySize: options.keySize,
        encoding: options.encoding
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Decrypt data
  decrypt(encryptedData, customOptions = {}) {
    try {
      const options = { ...this.options, ...customOptions };
      
      // Parse encrypted data
      const combined = CryptoJS.enc[options.encoding.toUpperCase()].parse(encryptedData);
      
      // Extract salt, iv, and ciphertext
      const saltSize = 16; // 128 bits
      const ivSize = options.ivSize * 4; // Convert words to bytes
      
      const salt = CryptoJS.lib.WordArray.create(combined.words.slice(0, saltSize / 4));
      const iv = CryptoJS.lib.WordArray.create(combined.words.slice(saltSize / 4, (saltSize + ivSize) / 4));
      const ciphertext = CryptoJS.lib.WordArray.create(
        combined.words.slice((saltSize + ivSize) / 4)
      );
      
      // Derive key
      const key = this.deriveKey(this.secretKey, salt, options.iterations);
      
      // Create cipher params
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: ciphertext
      });
      
      // Decrypt
      const decrypted = CryptoJS.AES.decrypt(cipherParams, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      
      return {
        success: true,
        data: decrypted.toString(CryptoJS.enc.Utf8)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Hash data
  hash(data, algorithm = HASH_ALGORITHMS.SHA256) {
    try {
      let hashed;
      
      switch (algorithm) {
        case HASH_ALGORITHMS.MD5:
          hashed = CryptoJS.MD5(data);
          break;
        case HASH_ALGORITHMS.SHA1:
          hashed = CryptoJS.SHA1(data);
          break;
        case HASH_ALGORITHMS.SHA256:
          hashed = CryptoJS.SHA256(data);
          break;
        case HASH_ALGORITHMS.SHA512:
          hashed = CryptoJS.SHA512(data);
          break;
        case HASH_ALGORITHMS.SHA3:
          hashed = CryptoJS.SHA3(data);
          break;
        case HASH_ALGORITHMS.RIPEMD160:
          hashed = CryptoJS.RIPEMD160(data);
          break;
        default:
          hashed = CryptoJS.SHA256(data);
      }
      
      return {
        success: true,
        data: hashed.toString(CryptoJS.enc.Hex),
        algorithm: algorithm
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  // HMAC
  hmac(data, key, algorithm = HASH_ALGORITHMS.SHA256) {
    try {
      const hmac = CryptoJS.HmacSHA256(data, key);
      
      return {
        success: true,
        data: hmac.toString(CryptoJS.enc.Hex),
        algorithm: algorithm
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
      }
// ==================== Advanced Encryption Functions ====================

// Encrypt with password
export const encryptWithPassword = (data, password, options = {}) => {
  try {
    const service = new EncryptionService(password, options);
    return service.encrypt(data);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Decrypt with password
export const decryptWithPassword = (encryptedData, password, options = {}) => {
  try {
    const service = new EncryptionService(password, options);
    return service.decrypt(encryptedData);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Encrypt object
export const encryptObject = (obj, secretKey, options = {}) => {
  try {
    const jsonStr = JSON.stringify(obj);
    const service = new EncryptionService(secretKey, options);
    return service.encrypt(jsonStr);
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Decrypt object
export const decryptObject = (encryptedData, secretKey, options = {}) => {
  try {
    const service = new EncryptionService(secretKey, options);
    const result = service.decrypt(encryptedData);
    
    if (result.success) {
      return {
        success: true,
        data: JSON.parse(result.data)
      };
    }
    
    return result;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Encrypt file
export const encryptFile = async (file, secretKey, options = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const fileData = event.target.result;
        const base64Data = fileData.split(',')[1] || fileData;
        
        const service = new EncryptionService(secretKey, options);
        const result = service.encrypt(base64Data);
        
        if (result.success) {
          // Create encrypted file blob
          const encryptedBlob = new Blob([result.data], {
            type: 'application/octet-stream'
          });
          
          const encryptedFile = new File(
            [encryptedBlob],
            `${file.name}.encrypted`,
            { type: 'application/octet-stream' }
          );
          
          resolve({
            success: true,
            file: encryptedFile,
            metadata: {
              originalName: file.name,
              originalSize: file.size,
              originalType: file.type,
              encryptedSize: encryptedBlob.size,
              algorithm: result.algorithm,
              keySize: result.keySize,
              encoding: result.encoding
            }
          });
        } else {
          reject(result);
        }
      } catch (error) {
        reject({
          success: false,
          error: error.message
        });
      }
    };
    
    reader.onerror = () => {
      reject({
        success: false,
        error: 'Failed to read file'
      });
    };
    
    reader.readAsDataURL(file);
  });
};

// Decrypt file
export const decryptFile = async (encryptedFile, secretKey, options = {}) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const encryptedData = event.target.result;
        
        const service = new EncryptionService(secretKey, options);
        const result = service.decrypt(encryptedData);
        
        if (result.success) {
          // Convert decrypted base64 to blob
          const byteCharacters = atob(result.data);
          const byteNumbers = new Array(byteCharacters.length);
          
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          
          const byteArray = new Uint8Array(byteNumbers);
          const decryptedBlob = new Blob([byteArray]);
          
          // Try to restore original filename
          const originalName = encryptedFile.name.replace(/\.encrypted$/, '');
          
          const decryptedFile = new File(
            [decryptedBlob],
            originalName,
            { type: 'application/octet-stream' }
          );
          
          resolve({
            success: true,
            file: decryptedFile,
            size: decryptedBlob.size
          });
        } else {
          reject(result);
        }
      } catch (error) {
        reject({
          success: false,
          error: error.message
        });
      }
    };
    
    reader.onerror = () => {
      reject({
        success: false,
        error: 'Failed to read encrypted file'
      });
    };
    
    reader.readAsText(encryptedFile);
  });
};

// Generate encryption key
export const generateEncryptionKey = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Generate key pair (for asymmetric encryption)
export const generateKeyPair = () => {
  // This is a placeholder - actual asymmetric encryption would use Web Crypto API
  const publicKey = generateEncryptionKey(64);
  const privateKey = generateEncryptionKey(128);
  
  return {
    publicKey,
    privateKey
  };
};

// Rotate encryption key
export const rotateEncryptionKey = (oldKey, newKey, encryptedData, options = {}) => {
  try {
    // Decrypt with old key
    const decrypted = decryptWithPassword(encryptedData, oldKey, options);
    
    if (!decrypted.success) {
      return decrypted;
    }
    
    // Encrypt with new key
    const reencrypted = encryptWithPassword(decrypted.data, newKey, options);
    
    return reencrypted;
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Multi-layer encryption
export const multiLayerEncrypt = (data, keys, options = {}) => {
  try {
    let currentData = data;
    const layers = [];
    
    for (let i = 0; i < keys.length; i++) {
      const result = encryptWithPassword(currentData, keys[i], options);
      
      if (!result.success) {
        return {
          success: false,
          error: `Encryption failed at layer ${i + 1}: ${result.error}`
        };
      }
      
      layers.push({
        key: keys[i],
        encryptedData: result.data,
        algorithm: result.algorithm,
        keySize: result.keySize
      });
      
      currentData = result.data;
    }
    
    return {
      success: true,
      data: currentData,
      layers: layers
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Multi-layer decryption
export const multiLayerDecrypt = (encryptedData, keys, options = {}) => {
  try {
    let currentData = encryptedData;
    
    for (let i = keys.length - 1; i >= 0; i--) {
      const result = decryptWithPassword(currentData, keys[i], options);
      
      if (!result.success) {
        return {
          success: false,
          error: `Decryption failed at layer ${i + 1}: ${result.error}`
        };
      }
      
      currentData = result.data;
    }
    
    return {
      success: true,
      data: currentData
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
// ==================== Encoding/Decoding Utilities ====================

// Base64 encode
export const base64Encode = (data) => {
  try {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    
    const wordArray = CryptoJS.enc.Utf8.parse(data);
    const base64 = CryptoJS.enc.Base64.stringify(wordArray);
    
    return {
      success: true,
      data: base64
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Base64 decode
export const base64Decode = (base64, parseJson = false) => {
  try {
    const wordArray = CryptoJS.enc.Base64.parse(base64);
    const utf8 = CryptoJS.enc.Utf8.stringify(wordArray);
    
    if (parseJson) {
      return {
        success: true,
        data: JSON.parse(utf8)
      };
    }
    
    return {
      success: true,
      data: utf8
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Hex encode
export const hexEncode = (data) => {
  try {
    if (typeof data === 'object') {
      data = JSON.stringify(data);
    }
    
    const wordArray = CryptoJS.enc.Utf8.parse(data);
    const hex = CryptoJS.enc.Hex.stringify(wordArray);
    
    return {
      success: true,
      data: hex
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// Hex decode
export const hexDecode = (hex, parseJson = false) => {
  try {
    const wordArray = CryptoJS.enc.Hex.parse(hex);
    const utf8 = CryptoJS.enc.Utf8.stringify(wordArray);
    
    if (parseJson) {
      return {
        success: true,
        data: JSON.parse(utf8)
      };
    }
    
    return {
      success: true,
      data: utf8
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

// ==================== Security Utilities ====================

// Generate random token
export const generateToken = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
};

// Generate OTP
export const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  
  return otp;
};

// Generate UUID
export const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Check password strength
export const checkPasswordStrength = (password) => {
  const strength = {
    score: 0,
    level: 'weak',
    color: '#ff4444',
    requirements: {
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      special: false,
      noCommon: true
    }
  };
  
  // Length check
  if (password.length >= 8) {
    strength.score++;
    strength.requirements.length = true;
  }
  if (password.length >= 12) strength.score++;
  
  // Uppercase check
  if (/[A-Z]/.test(password)) {
    strength.score++;
    strength.requirements.uppercase = true;
  }
  
  // Lowercase check
  if (/[a-z]/.test(password)) {
    strength.score++;
    strength.requirements.lowercase = true;
  }
  
  // Numbers check
  if (/\d/.test(password)) {
    strength.score++;
    strength.requirements.numbers = true;
  }
  
  // Special characters check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    strength.score += 2;
    strength.requirements.special = true;
  }
  
  // Common passwords check
  const commonPasswords = ['password', '123456', 'qwerty', 'admin', 'letmein', 'welcome'];
  if (commonPasswords.includes(password.toLowerCase())) {
    strength.score = 0;
    strength.requirements.noCommon = false;
  }
  
  // Determine strength level
  if (strength.score >= 8) {
    strength.level = 'very-strong';
    strength.color = '#2e7d32';
  } else if (strength.score >= 6) {
    strength.level = 'strong';
    strength.color = '#4caf50';
  } else if (strength.score >= 4) {
    strength.level = 'medium';
    strength.color = '#ffd966';
  } else if (strength.score >= 2) {
    strength.level = 'weak';
    strength.color = '#ff8c44';
  } else {
    strength.level = 'very-weak';
    strength.color = '#ff4444';
  }
  
  return strength;
};

// Mask sensitive data
export const maskSensitiveData = (data, visibleChars = 4) => {
  if (!data) return data;
  
  const str = String(data);
  if (str.length <= visibleChars) return '*'.repeat(str.length);
  
  const visible = str.slice(-visibleChars);
  const masked = '*'.repeat(str.length - visibleChars);
  
  return masked + visible;
};

// Sanitize input
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Escape special characters
  sanitized = sanitized
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/\\/g, '&#092;')
    .replace(/\//g, '&#047;');
  
  return sanitized;
};

// ==================== Compression Utilities ====================

// Simple compression (RLE)
export const compressRLE = (data) => {
  if (!data) return data;
  
  let compressed = '';
  let count = 1;
  
  for (let i = 0; i < data.length; i++) {
    if (data[i] === data[i + 1]) {
      count++;
    } else {
      compressed += (count > 1 ? count : '') + data[i];
      count = 1;
    }
  }
  
  return compressed;
};

// Simple decompression (RLE)
export const decompressRLE = (compressed) => {
  if (!compressed) return compressed;
  
  let decompressed = '';
  let i = 0;
  
  while (i < compressed.length) {
    if (/\d/.test(compressed[i])) {
      let count = '';
      while (/\d/.test(compressed[i])) {
        count += compressed[i];
        i++;
      }
      decompressed += compressed[i].repeat(parseInt(count));
    } else {
      decompressed += compressed[i];
    }
    i++;
  }
  
  return decompressed;
};

// ==================== Export ====================

export const encryptionUtils = {
  // Core encryption
  encryptWithPassword,
  decryptWithPassword,
  encryptObject,
  decryptObject,
  encryptFile,
  decryptFile,
  
  // Advanced encryption
  multiLayerEncrypt,
  multiLayerDecrypt,
  rotateEncryptionKey,
  generateEncryptionKey,
  generateKeyPair,
  
  // Encoding/Decoding
  base64Encode,
  base64Decode,
  hexEncode,
  hexDecode,
  
  // Security utilities
  generateToken,
  generateOTP,
  generateUUID,
  checkPasswordStrength,
  maskSensitiveData,
  sanitizeInput,
  
  // Compression
  compressRLE,
  decompressRLE,
  
  // Constants
  ENCRYPTION_ALGORITHMS,
  HASH_ALGORITHMS,
  ENCODING_FORMATS,
  ENCRYPTION_STRENGTHS,
  KEY_DERIVATION_FUNCTIONS,
  DEFAULT_ENCRYPTION_OPTIONS
};

export default encryptionUtils;
