const crypto = require('crypto');

const ALGORITHM = 'aes-256-gcm';
// Default key used only as fallback. Length must be 32 bytes (64 hex characters) for aes-256
const getSecretKey = () => {
    return Buffer.from(process.env.VAULT_SECRET_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
};

exports.encryptPassword = (password) => {
  const iv = crypto.randomBytes(12); // 12 bytes is standard for GCM
  const cipher = crypto.createCipheriv(ALGORITHM, getSecretKey(), iv);
  
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return {
    encryptedPassword: encrypted,
    iv: iv.toString('hex'),
    authTag: authTag
  };
};

exports.decryptPassword = (encryptedPassword, iv, authTag) => {
  const decipher = crypto.createDecipheriv(
    ALGORITHM, 
    getSecretKey(), 
    Buffer.from(iv, 'hex')
  );
  
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  
  let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};
