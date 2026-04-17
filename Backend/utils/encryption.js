import crypto from "crypto";

const algorithm = "chacha20-poly1305";

const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

// Safety checks
if (!process.env.ENCRYPTION_KEY) {
  throw new Error("ENCRYPTION_KEY is not set in .env");
}

if (key.length !== 32) {
  throw new Error("ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

export const encrypt = (text) => {
  const iv = crypto.randomBytes(12);

  const cipher = crypto.createCipheriv(algorithm, key, iv, {
    authTagLength: 16,
  });

  const encrypted = Buffer.concat([
    cipher.update(text, "utf8"),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return {
    content: encrypted.toString("hex"),
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
  };
};

export const decrypt = (encryptedData) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(encryptedData.iv, "hex"),
    { authTagLength: 16 }
  );

  decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedData.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
};