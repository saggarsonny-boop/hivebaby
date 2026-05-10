import { createHash } from "crypto";

export const maxUploadBytes = 10 * 1024 * 1024;

export function validatePdfUpload(file: File) {
  const nameOk = file.name.toLowerCase().endsWith(".pdf");
  const typeOk = file.type === "application/pdf" || file.type === "application/octet-stream";
  return file.size > 0 && file.size <= maxUploadBytes && nameOk && typeOk;
}

export function sha256(bytes: Buffer) {
  return createHash("sha256").update(bytes).digest("hex");
}

export async function putSecureObject(params: { organizationId: string; bytes: Buffer; fileName: string }) {
  const hash = sha256(params.bytes);
  return {
    storageKey: `${params.organizationId}/${hash}/${params.fileName.replace(/[^a-zA-Z0-9._-]/g, "_")}`,
    sha256Hash: hash
  };
}

export async function createSignedDownloadUrl(storageKey: string) {
  return {
    url: `/api/files/secure-download-placeholder?key=${encodeURIComponent(storageKey)}`,
    expiresInSeconds: 300
  };
}

export async function deleteSecureObject(_storageKey: string) {
  return { deleted: true };
}
