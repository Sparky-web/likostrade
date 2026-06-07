export const MAX_UPLOAD_FILE_SIZE_BYTES = 20 * 1024 * 1024;

export const MAX_UPLOAD_FILE_SIZE_MB = 20;

/** Размер полезной нагрузки base64 в байтах (без data URL prefix). */
export function getBase64PayloadByteLength(base64: string): number {
  const payload = base64.replace(/^data:.+;base64,/, "");
  const padding = payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0;
  return Math.floor(payload.length * 3 / 4) - padding;
}

export function isWithinMaxUploadFileSize(bytes: number): boolean {
  return bytes <= MAX_UPLOAD_FILE_SIZE_BYTES;
}
