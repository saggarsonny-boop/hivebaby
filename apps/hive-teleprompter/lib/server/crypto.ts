import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { ApiError } from "./errors";

function getKey() {
  const raw = process.env.APP_ENCRYPTION_KEY;
  if (!raw) throw new ApiError(500, "Encryption is not configured.", "encryption_not_configured");
  const normalized = raw.startsWith("base64:") ? Buffer.from(raw.slice(7), "base64") : Buffer.from(raw, "hex");
  if (normalized.length !== 32) throw new ApiError(500, "Encryption key is invalid.", "encryption_key_invalid");
  return normalized;
}

export function encryptPHI(plainText: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("base64")}:${tag.toString("base64")}:${ciphertext.toString("base64")}`;
}

export function decryptPHI(cipherText: string) {
  const [version, iv, tag, ciphertext] = cipherText.split(":");
  if (version !== "v1" || !iv || !tag || !ciphertext) throw new ApiError(500, "Encrypted payload is invalid.", "encrypted_payload_invalid");
  const decipher = createDecipheriv("aes-256-gcm", getKey(), Buffer.from(iv, "base64"));
  decipher.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertext, "base64")), decipher.final()]).toString("utf8");
}

export function hashPHIReference(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
